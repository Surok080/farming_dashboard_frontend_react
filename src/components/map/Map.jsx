import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, ZoomControl } from "react-leaflet";
import { Backdrop, Box, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useSnackbar } from "notistack";
import { httpService } from "../../api/setup";
import Layers from "./Layers";
import MapSidebar from "./MapSidebar";
import MapLegend from "./MapLegend";
import MapControls from "./MapControls";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { TelemetryModal, SatelliteModal } from "./IntegrationModals";
import FieldInfoModal from "./FieldInfoModal";
import { useFieldsData } from "../../hooks/useFieldsData";
import { useModalState } from "../../hooks/useModalState";

const Map = memo(({ year, setAllArea }) => {
  // UI состояния
  const [tabValue, setTabValue] = useState("1");
  const [searchValue, setSearchValue] = useState("");
  const [grouping, setGrouping] = useState("crop");
  const [hideMenu, setHideMenu] = useState(false);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  
  // Работа с данными
  const [activeArea, setActiveArea] = useState(null);
  const [deleteIdArea, setDeleteIdArea] = useState(null);
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
    refetch: refetchFields 
  } = useFieldsData(year, grouping, handleDataError);
  
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
      item.properties.crop?.toLowerCase().includes(lowerSearch)
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
  
  // Удаление поля
  const deletArea = () => {
    if (!deleteIdArea) return;
    
    const seasonIds = Array.isArray(deleteIdArea) ? deleteIdArea : [deleteIdArea];
    
    httpService
      .delete(`/fields_v2`, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: {
          year: year,
          season_ids: seasonIds
        }
      })
      .then((res) => {
        if (res.status === 200) {
          refetchFields();
          enqueueSnackbar("Поле успешно удалено", {
            autoHideDuration: 4000,
            variant: "success",
          });
        } else {
          enqueueSnackbar("Ошибка удаления поля", {
            autoHideDuration: 4000,
            variant: "error",
          });
        }
      })
      .catch(() => {
        enqueueSnackbar("Ошибка удаления поля", {
          autoHideDuration: 4000,
          variant: "error",
        });
      })
      .finally(() => {
        modals.confirmDelete.closeModal();
      });
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
          setDeleteIdArea={setDeleteIdArea}
          handleOpenConfirmDelete={modals.confirmDelete.openModal}
          setHoveredFieldId={setHoveredFieldId}
          statistics={statistics}
          colorLayers={colorLayers}
          year={year}
          tabValue={tabValue}
          onTabChange={handleTabChange}
        />
        
        <MapContainer
          center={
            Array.isArray(layer?.center) && layer.center.length >= 2
              ? [layer.center[1], layer.center[0]]
              : [56.66163543086128, 54.6566711425781]
          }
          zoom={12}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", position: "relative" }}
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
              hideMenu={hideMenu}
              isSmallScreen={isSmallScreen}
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
      
      {/* Модальные окна */}
      <ConfirmDeleteModal
        deletArea={deletArea}
        handleCloseConfirmDelete={modals.confirmDelete.closeModal}
        openConfirmDelete={modals.confirmDelete.open}
        deleteIdArea={deleteIdArea}
      />
      
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <TelemetryModal
        open={modals.telemetry.open}
        onClose={modals.telemetry.closeModal}
      />
      
      <SatelliteModal
        open={modals.satellite.open}
        onClose={modals.satellite.closeModal}
      />
      
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

export default Map;
