import { useState, useEffect, useCallback, useRef } from 'react';
import { httpService } from '../api/setup';
import { getAreaLayers, getColorLayers } from '../utils/mapUtils';

const DEFAULT_COLORS = [
  '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0',
  '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63',
  '#3f51b5', '#009688', '#ff5722', '#673ab7', '#e0c020'
];

/**
 * Собирает отображаемое имя поля из новой структуры (cultivar + field_name) или старой (name).
 */
function getFieldDisplayName(props) {
  if (!props) return '';
  if (props.name) return props.name;
  const cultivar = (props.cultivar || '').trim();
  const fieldName = (props.field_name || '').trim();
  if (cultivar && fieldName) return `${cultivar} (${fieldName})`;
  return fieldName || cultivar || '';
}

/**
 * Маппинг группировки в view_type для API: null | 'by_culture' | 'by_group'
 */
export const groupingToViewType = (grouping) => {
  if (grouping === 'by_culture' || grouping === 'crop') return 'by_culture';
  if (grouping === 'by_group' || grouping === 'crop_group') return 'by_group';
  return null; // 'all' или без группировки
};

/**
 * Строит маппинги fieldId -> culture_name, fieldId -> group_name и палитру цветов
 * по данным ответа в зависимости от view_type (all / by_culture / by_group).
 */
function buildMapsFromResponse(data, viewType) {
  const fieldToCulture = {};
  const fieldToGroup = {};
  const cultureColors = {};
  const groupColors = {};
  const dataList = data?.data || [];

  if (viewType === 'all' || !viewType) {
    // data: [{ id, culture_id, culture_name, name, area }]
    const seen = new Set();
    dataList.forEach((item, idx) => {
      if (item.id != null) {
        fieldToCulture[item.id] = item.culture_name || 'Неизвестно';
        fieldToGroup[item.id] = fieldToCulture[item.id];
        const name = item.culture_name || 'Неизвестно';
        if (!seen.has(name)) {
          seen.add(name);
          cultureColors[name] = DEFAULT_COLORS[Object.keys(cultureColors).length % DEFAULT_COLORS.length];
        }
      }
    });
  } else if (viewType === 'by_culture') {
    // data: [{ culture_id, culture_name, count, area, fields: [{ id, name, area, culture_name }], total_area }]
    dataList.forEach((group, groupIdx) => {
      const cultureName = group.culture_name || 'Неизвестно';
      cultureColors[cultureName] = DEFAULT_COLORS[groupIdx % DEFAULT_COLORS.length];
      (group.fields || []).forEach((f) => {
        if (f.id != null) {
          fieldToCulture[f.id] = f.culture_name || cultureName;
          fieldToGroup[f.id] = cultureName;
        }
      });
    });
  } else if (viewType === 'by_group') {
    // data: [{ group_name, cultures_count, fields_count, fields: [...], total_area }]
    dataList.forEach((group, groupIdx) => {
      const groupName = group.group_name || 'Неизвестно';
      groupColors[groupName] = DEFAULT_COLORS[groupIdx % DEFAULT_COLORS.length];
      (group.fields || []).forEach((f) => {
        if (f.id != null) {
          fieldToCulture[f.id] = f.culture_name || 'Неизвестно';
          fieldToGroup[f.id] = groupName;
        }
      });
    });
  }

  return { fieldToCulture, fieldToGroup, cultureColors, groupColors };
}

/**
 * Кастомный хук для работы с данными полей из plan_fact_v2
 * Запрос: GET /plan_fact_v2/fields/map?year=&view_type= (view_type: null | by_culture | by_group)
 */
export const usePlanFactFieldsData = (year, grouping, onError) => {
  const [layer, setLayer] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [colorLayers, setColorLayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalArea, setTotalArea] = useState(0);
  const [center, setCenter] = useState(null);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const resetData = useCallback(() => {
    setLayer(null);
    setStatistics([]);
    setColorLayers([]);
    setTotalArea(0);
    setCenter(null);
  }, []);

  const fetchFieldsData = useCallback(async () => {
    if (!year) {
      resetData();
      return;
    }

    const viewType = groupingToViewType(grouping);

    setLoading(true);
    try {
      const params = { year: Number(year) };
      if (viewType != null) {
        params.view_type = viewType;
      }

      const res = await httpService.get('/plan_fact_v2/fields/map', { params });

      if (res?.status === 200 && res.data) {
        const d = res.data;
        if (d.center) setCenter(d.center);

        const viewTypeFromResponse = d.view_type || viewType;
        const { fieldToCulture, fieldToGroup, cultureColors, groupColors } = buildMapsFromResponse(d, viewTypeFromResponse);

        const features = (d.features || []).map((feature, index) => {
          const props = feature.properties || {};
          const fieldId = props.id ?? feature.id;
          const displayName = getFieldDisplayName(props);
          const cropName = fieldToCulture[fieldId] || props.culture_name || (displayName ? displayName.split(' ')[0] : '') || 'Неизвестно';
          const cropGroup = fieldToGroup[fieldId] || cropName;

          const useGroupColor = (viewTypeFromResponse === 'by_group' && groupColors[cropGroup]);
          const color = useGroupColor
            ? groupColors[cropGroup]
            : (cultureColors[cropName] || props.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]);

          return {
            ...feature,
            properties: {
              ...props,
              id: fieldId ?? index,
              name: displayName,
              crop: cropName,
              crop_name: cropName,
              crop_group: cropGroup,
              color,
              center: props.center || feature.geometry?.center || null,
            }
          };
        });

        const geoJsonData = {
          type: 'FeatureCollection',
          features,
          center: d.center,
          total_area: features.reduce((sum, f) => sum + (f.properties?.area || 0), 0)
        };

        setLayer(geoJsonData);
        setTotalArea(geoJsonData.total_area?.toFixed(2) || 0);

        const nameParam = viewTypeFromResponse === 'by_group' ? 'crop_group' : 'crop';
        getAreaLayers(geoJsonData, setStatistics, nameParam);
        getColorLayers(geoJsonData, setColorLayers, nameParam);
      } else {
        resetData();
      }
    } catch (error) {
      resetData();
      if (onErrorRef.current) onErrorRef.current(error);
    } finally {
      setLoading(false);
    }
  }, [year, grouping, resetData]);

  useEffect(() => {
    fetchFieldsData();
  }, [fetchFieldsData]);

  return {
    layer,
    statistics,
    colorLayers,
    loading,
    totalArea,
    center,
    refetch: fetchFieldsData,
    reset: resetData,
  };
};
