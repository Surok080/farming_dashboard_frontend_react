import { useState, useEffect, useCallback, useRef } from 'react';
import { httpService } from '../api/setup';
import { transformNewDataToGeoJSON } from '../utils/fieldTransformers';
import { getAreaLayers, getColorLayers } from '../utils/mapUtils';

/**
 * Кастомный хук для работы с данными полей
 */
export const useFieldsData = (year, grouping, onError) => {
  const [layer, setLayer] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [colorLayers, setColorLayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalArea, setTotalArea] = useState(0);

  // Используем ref для хранения последней версии onError, чтобы не включать его в зависимости
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const resetData = useCallback(() => {
    setLayer(null);
    setStatistics([]);
    setColorLayers([]);
    setTotalArea(0);
  }, []);

  const fetchFieldsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpService.get(`/fields_v2?year=${year}&group=${grouping}`);
      
      if (res?.status === 200 && res.data) {
        const transformedData = transformNewDataToGeoJSON(res.data, grouping);
        
        setLayer(transformedData);
        setTotalArea(transformedData.total_area?.toFixed(2) || 0);
        getAreaLayers(transformedData, setStatistics, grouping);
        getColorLayers(transformedData, setColorLayers, grouping);
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
    refetch: fetchFieldsData,
    reset: resetData,
  };
};

