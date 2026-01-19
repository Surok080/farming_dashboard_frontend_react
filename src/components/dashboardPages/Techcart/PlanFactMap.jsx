import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, ZoomControl } from "react-leaflet";
import { Backdrop, Box, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useSnackbar } from "notistack";
import Layers from "../../map/Layers";
import MapSidebar from "../../map/MapSidebar";
import MapLegend from "../../map/MapLegend";
import MapControls from "../../map/MapControls";
import FieldInfoModal from "../../map/FieldInfoModal";
import { usePlanFactFieldsData } from "../../../hooks/usePlanFactFieldsData";
import { useModalState } from "../../../hooks/useModalState";

const PlanFactMap = memo(({ year, planType, setAllArea }) => {
  // UI состояния
  const [tabValue, setTabValue] = useState("1");
  const [searchValue, setSearchValue] = useState("");
  const [grouping, setGrouping] = useState("crop");
  const [hideMenu, setHideMenu] = useState(false);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  
  // Работа с данными
  const [activeArea, setActiveArea] = useState(null);
  const [hoveredFieldId, setHoveredFieldId] = useState(null);
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const { enqueueSnackbar } = useSnackbar();
  
  // Управление модальными окнами
  const modals = useModalState();
  
  // Обработка ошибок
  const handleDataError = useCallback((error) => {
    enqueueSnackbar("Ошибка при загрузке данных", {
      autoHideDuration: 4000,
      variant: "error",
    });
  }, [enqueueSnackbar]);
  
  // Загрузка данных
  const { 
    layer, 
    statistics, 
    colorLayers, 
    loading, 
    totalArea,
    center: mapCenter,
    refetch: refetchFields 
  } = usePlanFactFieldsData(year, planType, grouping, handleDataError);
  
  // Центр карты по умолчанию или из данных
  // В API center приходит как [lng, lat], а для MapContainer нужен [lat, lng]
  const defaultCenter = mapCenter 
    ? [mapCenter[1], mapCenter[0]] 
    : [56.66163543086128, 54.6566711425781];
  
  // Обновляем общую площадь при изменении данных
  useEffect(() => {
    if (totalArea && setAllArea) {
      setAllArea(totalArea);
    }
  }, [totalArea, setAllArea]);
  
  // Фильтрация полей по поисковому запросу
  const layerSearch = useMemo(() => {
    if (!layer?.features) return null;
    if (!searchValue) return layer.features;
    
    const lowerSearch = searchValue.toLowerCase();
    return layer.features.filter((item) =>
      item.properties.name?.toLowerCase().includes(lowerSearch) ||
      item.properties.id?.toString().includes(lowerSearch)
    );
  }, [searchValue, layer]);
  
  // Управление backdrop
  useEffect(() => {
    if (loading) {
      setOpenBackdrop(true);
    } else {
      setTimeout(() => {
        setOpenBackdrop(false);
      }, 1000);
    }
  }, [loading]);
  
  // Обработчики
  const handleChangeGrouping = (event) => {
    setGrouping(event.target.value);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSpeedDialAction = (actionType) => {
    if (actionType === 'satellite') {
      modals.satellite.openModal();
    } else if (actionType === 'telemetry') {
      modals.telemetry.openModal();
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          position: "relative",
          height: "100%",
        }}
      >
        <MapSidebar
          hideMenu={hideMenu}
          setHideMenu={setHideMenu}
          isSmallScreen={isSmallScreen}
          grouping={grouping}
          onGroupingChange={handleChangeGrouping}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          layerSearch={layerSearch}
          onFieldClick={modals.fieldInfo.openModal}
          setActiveArea={setActiveArea}
          setDeleteIdArea={null} // Отключаем удаление для plan_fact карты
          handleOpenConfirmDelete={null} // Отключаем удаление
          setHoveredFieldId={setHoveredFieldId}
          statistics={statistics}
          colorLayers={colorLayers}
          year={year}
          tabValue={tabValue}
          onTabChange={handleTabChange}
        />
        
        <MapContainer
          center={defaultCenter}
          zoom={12}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", position: "relative" }}
          key={`map-${mapCenter?.[0]}-${mapCenter?.[1]}`} // Пересоздаем карту при изменении центра
        >
          {tabValue !== "2" && (
            <ZoomControl position="topright" className="custom-zoom-control" />
          )}
          {layer && (
            <Layers
              year={year}
              layer={layer}
              activeArea={activeArea}
              setActiveArea={setActiveArea}
              onFieldClick={modals.fieldInfo.openModal}
              isModalOpen={modals.fieldInfo.open}
              hoveredFieldId={hoveredFieldId}
              hideLayerControl={tabValue === "2"}
            />
          )}
        </MapContainer>
        
        {layer && tabValue !== "2" && (
          <>
            <MapLegend
              statistics={statistics}
              colorLayers={colorLayers}
              isSmallScreen={isSmallScreen}
            />
            <MapControls
              openSpeedDial={openSpeedDial}
              setOpenSpeedDial={setOpenSpeedDial}
              onActionClick={handleSpeedDialAction}
            />
          </>
        )}
      </div>
      
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <FieldInfoModal
        open={modals.fieldInfo.open}
        onClose={modals.fieldInfo.closeModal}
        field={modals.fieldInfo.selectedField}
        year={year}
        rotationHistory={modals.fieldInfo.selectedField?.properties?.rotation_history || []}
      />
    </>
  );
});

export default PlanFactMap;
