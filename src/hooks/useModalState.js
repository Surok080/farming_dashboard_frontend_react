import { useState, useCallback } from 'react';

/**
 * Кастомный хук для управления состоянием модальных окон
 */
export const useModalState = () => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [fieldInfo, setFieldInfo] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const openConfirmDelete = useCallback(() => setConfirmDelete(true), []);
  const closeConfirmDelete = useCallback(() => setConfirmDelete(false), []);
  
  const openTelemetry = useCallback(() => setTelemetry(true), []);
  const closeTelemetry = useCallback(() => setTelemetry(false), []);
  
  const openSatellite = useCallback(() => setSatellite(true), []);
  const closeSatellite = useCallback(() => setSatellite(false), []);
  
  const openFieldInfo = useCallback((field) => {
    setSelectedField(field);
    setFieldInfo(true);
  }, []);
  
  const closeFieldInfo = useCallback(() => {
    setFieldInfo(false);
    setSelectedField(null);
  }, []);

  return {
    confirmDelete: {
      open: confirmDelete,
      openModal: openConfirmDelete,
      closeModal: closeConfirmDelete,
    },
    telemetry: {
      open: telemetry,
      openModal: openTelemetry,
      closeModal: closeTelemetry,
    },
    satellite: {
      open: satellite,
      openModal: openSatellite,
      closeModal: closeSatellite,
    },
    fieldInfo: {
      open: fieldInfo,
      selectedField,
      openModal: openFieldInfo,
      closeModal: closeFieldInfo,
    },
  };
};

