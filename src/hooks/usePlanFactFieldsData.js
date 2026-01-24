import { useState, useEffect, useCallback, useRef } from 'react';
import { httpService } from '../api/setup';
import { getAreaLayers, getColorLayers } from '../utils/mapUtils';

/**
 * Кастомный хук для работы с данными полей из plan_fact_v2
 */
export const usePlanFactFieldsData = (year, planType, grouping, onError) => {
  const [layer, setLayer] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [colorLayers, setColorLayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalArea, setTotalArea] = useState(0);
  const [rawData, setRawData] = useState(null);
  const [center, setCenter] = useState(null);
  const lastGroupingRef = useRef(grouping);

  // Используем ref для хранения последней версии onError
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const resetData = useCallback(() => {
    setLayer(null);
    setStatistics([]);
    setColorLayers([]);
    setTotalArea(0);
    setRawData(null);
    setCenter(null);
  }, []);

  // Функция для создания маппинга полей к группам из label_list
  const createFieldToGroupMap = (labelList) => {
    const fieldToGroupMap = {};
    const groupColors = {};
    
    if (!labelList?.groups || !Array.isArray(labelList.groups)) {
      return { fieldToGroupMap, groupColors };
    }
    
    // Палитра цветов для групп
    const colors = [
      '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0',
      '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63',
      '#3f51b5', '#009688', '#ff5722', '#673ab7', '#e0c020'
    ];
    
    // Создаем маппинг fieldId -> culture_name и назначаем цвета группам
    labelList.groups.forEach((group, groupIndex) => {
      const cultureName = group.culture_name || 'Неизвестно';
      const groupColor = colors[groupIndex % colors.length];
      groupColors[cultureName] = groupColor;
      
      if (group.fields && Array.isArray(group.fields)) {
        group.fields.forEach((field) => {
          if (field.id) {
            fieldToGroupMap[field.id] = cultureName;
          }
        });
      }
    });
    
    return { fieldToGroupMap, groupColors };
  };

  const fetchFieldsData = useCallback(async () => {
    if (!year || !planType) {
      resetData();
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: year,
        plan_type: planType
      };
      
      const res = await httpService.get('/plan_fact_v2/fields/map', { params });
      
      if (res?.status === 200 && res.data) {
        // Сохраняем исходные данные
        setRawData(res.data);
        lastGroupingRef.current = grouping;
        
        // Сохраняем центр карты
        if (res.data.center) {
          setCenter(res.data.center);
        }
        
        // Создаем маппинг полей к группам из label_list
        const { fieldToGroupMap, groupColors } = createFieldToGroupMap(res.data.label_list);
        
        // Преобразуем данные в формат GeoJSON и добавляем необходимые свойства
        const features = (res.data.features || []).map((feature, index) => {
          const fieldId = feature.properties?.id;
          
          // Извлекаем название культуры из name (например, "Горох Синбир (0.11)" -> "Горох")
          const name = feature.properties?.name || '';
          const cropName = name.split(' ')[0] || 'Неизвестно';
          
          // Определяем группу для поля из маппинга
          const cropGroup = fieldToGroupMap[fieldId] || cropName;
          
          // Определяем цвет: если группировка по группам, используем цвет группы, иначе - цвет по индексу
          let color;
          if (grouping === 'crop_group' && groupColors[cropGroup]) {
            color = groupColors[cropGroup];
          } else {
            const defaultColors = [
              '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0',
              '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63'
            ];
            color = feature.properties?.color || defaultColors[index % defaultColors.length];
          }
          
          return {
            ...feature,
            properties: {
              ...feature.properties,
              id: fieldId || index,
              crop: cropName,
              crop_name: cropName,
              crop_group: cropGroup,
              color: color,
              // Добавляем center из geometry если его нет
              center: feature.properties?.center || feature.geometry?.center || null,
            }
          };
        });
        
        const geoJsonData = {
          type: 'FeatureCollection',
          features: features,
          center: res.data.center,
          total_area: features.reduce((sum, feature) => {
            return sum + (feature.properties?.area || 0);
          }, 0)
        };
        
        setLayer(geoJsonData);
        setTotalArea(geoJsonData.total_area?.toFixed(2) || 0);
        getAreaLayers(geoJsonData, setStatistics, grouping);
        getColorLayers(geoJsonData, setColorLayers, grouping);
      } else {
        resetData();
      }
    } catch (error) {
      resetData();
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    } finally {
      setLoading(false);
    }
  }, [year, planType, resetData, grouping]);

  useEffect(() => {
    fetchFieldsData();
  }, [fetchFieldsData]);

  // Обрабатываем группировку на фронтенде без запроса к серверу
  useEffect(() => {
    if (rawData && lastGroupingRef.current !== grouping) {
      lastGroupingRef.current = grouping;
      
      // Создаем маппинг полей к группам из label_list
      const { fieldToGroupMap, groupColors } = createFieldToGroupMap(rawData.label_list);
      
      const features = (rawData.features || []).map((feature, index) => {
        const fieldId = feature.properties?.id;
        const name = feature.properties?.name || '';
        const cropName = name.split(' ')[0] || 'Неизвестно';
        
        // Определяем группу для поля из маппинга
        const cropGroup = fieldToGroupMap[fieldId] || cropName;
        
        // Определяем цвет: если группировка по группам, используем цвет группы, иначе - цвет по индексу
        let color;
        if (grouping === 'crop_group' && groupColors[cropGroup]) {
          color = groupColors[cropGroup];
        } else {
          const defaultColors = [
            '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0',
            '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63'
          ];
          color = feature.properties?.color || defaultColors[index % defaultColors.length];
        }
        
        return {
          ...feature,
          properties: {
            ...feature.properties,
            id: fieldId || index,
            crop: cropName,
            crop_name: cropName,
            crop_group: cropGroup,
            color: color,
            center: feature.properties?.center || feature.geometry?.center || null,
          }
        };
      });
      
      const geoJsonData = {
        type: 'FeatureCollection',
        features: features,
        center: rawData.center,
        total_area: features.reduce((sum, feature) => {
          return sum + (feature.properties?.area || 0);
        }, 0)
      };
      setLayer(geoJsonData);
      getAreaLayers(geoJsonData, setStatistics, grouping);
      getColorLayers(geoJsonData, setColorLayers, grouping);
    }
  }, [grouping, rawData]);

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
