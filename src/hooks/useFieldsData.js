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
  const [rawData, setRawData] = useState(null); // Сохраняем исходные данные с бэкенда
  const lastGroupingRef = useRef(grouping); // Отслеживаем последнюю группировку

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
    setRawData(null);
  }, []);

  const fetchFieldsData = useCallback(async () => {
    setLoading(true);
    try {
      // Убираем group из запроса, группировка теперь на фронтенде
      const res = await httpService.get(`/fields_v2?year=${year}`);
      
      if (res?.status === 200 && res.data) {
        // Сохраняем исходные данные для повторной трансформации при изменении группировки
        setRawData(res.data);
        lastGroupingRef.current = grouping; // Обновляем ref при первой загрузке
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
  }, [year, resetData]); // Убираем grouping из зависимостей, чтобы не делать запрос при изменении группировки

  useEffect(() => {
    fetchFieldsData();
  }, [fetchFieldsData]);

  // Обрабатываем группировку на фронтенде без запроса к серверу
  useEffect(() => {
    // Трансформируем только если изменилась группировка и есть исходные данные
    if (rawData && lastGroupingRef.current !== grouping) {
      lastGroupingRef.current = grouping;
      // Используем сохраненные исходные данные для повторной трансформации
      const transformedData = transformNewDataToGeoJSON(rawData, grouping);
      setLayer(transformedData);
      getAreaLayers(transformedData, setStatistics, grouping);
      getColorLayers(transformedData, setColorLayers, grouping);
    }
  }, [grouping, rawData]); // Только при изменении группировки, без запроса

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

