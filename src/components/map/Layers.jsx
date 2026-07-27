import React, {memo, useEffect, useRef, useState} from "react";
import {GeoJSON, LayerGroup, LayersControl, TileLayer, Tooltip, useMap} from "react-leaflet";
import {Typography} from "@mui/material";
import L from "leaflet";

const SIDEBAR_WIDTH_DESKTOP = 400;
const SIDEBAR_WIDTH_MOBILE = 300;

const getSidebarWidth = (hideMenu, isSmallScreen) => {
  if (hideMenu) return 0;
  return isSmallScreen ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH_DESKTOP;
};

const LEGEND_WIDTH = 200;
/** Увеличивать при смене логики fit — иначе HMR/повторный рендер не пересчитает зум. */
const FIT_VERSION = 4;

const getFitBoundsPadding = (map, hideMenu, isSmallScreen) => {
  const sidebarWidth = getSidebarWidth(hideMenu, isSmallScreen);
  const mapWidth = map.getSize()?.x || 0;
  const leftPad = sidebarWidth > 0
    ? Math.min(sidebarWidth + 16, Math.max(40, mapWidth * 0.4))
    : 40;
  const rightPad = Math.min(LEGEND_WIDTH + 16, Math.max(40, mapWidth * 0.22));
  return {
    paddingTopLeft: [leftPad, 32],
    paddingBottomRight: [rightPad, 32],
  };
};

const collectFeatureBounds = (features) => {
  const bounds = L.latLngBounds([]);
  let hasPoints = false;

  features.forEach((feature) => {
    if (!feature?.geometry) return;
    try {
      const featureBounds = L.geoJSON(feature).getBounds();
      if (featureBounds.isValid()) {
        bounds.extend(featureBounds);
        hasPoints = true;
      }
    } catch {
      // пропускаем битую геометрию
    }
  });

  return hasPoints && bounds.isValid() ? bounds : null;
};

const Layers = memo(({
  layer,
  activeArea,
  setActiveArea,
  year,
  onFieldClick,
  isModalOpen,
  hoveredFieldId,
  hideLayerControl = false,
  hideMenu = false,
  isSmallScreen = false,
}) => {
  const [tooltipKey, setTooltipKey] = useState(0);
  const map = useMap();
  const fittedKeyRef = useRef(null);

  // Управление тултипами при открытии/закрытии модального окна
  useEffect(() => {
    if (isModalOpen) {
      // При открытии модального окна - закрываем все тултипы
      map.closePopup();
      // Закрываем все тултипы через DOM
      const tooltips = document.querySelectorAll('.leaflet-tooltip');
      tooltips.forEach(tooltip => {
        tooltip.style.display = 'none';
      });
    } else {
      // При закрытии модального окна - закрываем все тултипы и обновляем ключ
      map.closePopup();
      const tooltips = document.querySelectorAll('.leaflet-tooltip');
      tooltips.forEach(tooltip => {
        tooltip.style.display = 'none';
      });
      // Обновляем ключ для принудительного пересоздания тултипов
      setTooltipKey(prev => prev + 1);
    }
  }, [isModalOpen, map]);

  // При загрузке нового набора полей — один раз вмещаем их в видимую зону (справа от панели)
  useEffect(() => {
    if (!layer?.features?.length) return;

    // Ключ по данным слоя + версия fit: при смене года со старым layer не фитим, ждём новый layer
    const fitKey = [
      FIT_VERSION,
      layer.features.length,
      layer.center?.[0],
      layer.center?.[1],
      layer.total_area,
      layer.features[0]?.properties?.id,
    ].join(":");
    if (fittedKeyRef.current === fitKey) return;

    const bounds = collectFeatureBounds(layer.features);
    const centerLatLng = bounds
      ? bounds.getCenter()
      : Array.isArray(layer.center) && layer.center.length >= 2
        ? L.latLng(layer.center[1], layer.center[0])
        : null;

    const fitAllFields = () => {
      map.invalidateSize();

      if (!bounds) {
        if (!centerLatLng) return;
        fittedKeyRef.current = fitKey;
        map.setView(centerLatLng, 12, { animate: false });
        return;
      }

      fittedKeyRef.current = fitKey;

      map.fitBounds(bounds, {
        ...getFitBoundsPadding(map, hideMenu, isSmallScreen),
        maxZoom: 16,
        animate: false,
      });
    };

    const timeoutId = window.setTimeout(fitAllFields, 50);
    return () => window.clearTimeout(timeoutId);
  }, [layer, map, hideMenu, isSmallScreen]);

  useEffect(() => {
    if (activeArea) {
      // Вычисляем центр поля
      let centerLat, centerLng;
      
      if (activeArea.properties.center && Array.isArray(activeArea.properties.center)) {
        // Используем готовые координаты центра
        centerLng = activeArea.properties.center[0];
        centerLat = activeArea.properties.center[1];
      } else {
        // Вычисляем центр из геометрии
        const coordinates = activeArea.geometry.coordinates[0];
        
        // Обрабатываем MultiPolygon: coordinates[0][0] - первый полигон, первый ring
        if (activeArea.geometry.type === 'MultiPolygon' && coordinates[0] && Array.isArray(coordinates[0][0])) {
          const firstRing = coordinates[0][0];
          centerLat = firstRing.reduce((sum, coord) => sum + coord[1], 0) / firstRing.length;
          centerLng = firstRing.reduce((sum, coord) => sum + coord[0], 0) / firstRing.length;
        } else {
          // Обычный Polygon
          centerLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
          centerLng = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
        }
      }
      
      // Проверяем, что координаты валидные
      if (!isNaN(centerLat) && !isNaN(centerLng)) {
        map.setView([centerLat, centerLng], 13, {
          animate: true,
          duration: 1
        });
      }
      
      setActiveArea(null);
    }
  }, [activeArea, map]);

  return (
    <>
      {hideLayerControl ? (
        /* Базовый слой когда LayersControl скрыт */
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          ext="png"
        />
      ) : (
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Basic Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
              ext="png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topo Map">
            <TileLayer
              attribution='Map data: &amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &amp;copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="WorldImagery">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
      )}
      
      {/* Поля всегда отображаются */}
      {layer.features &&
        layer.features.map((item, key) => {
          const isHovered = hoveredFieldId === item.properties.id;
          return (
            <LayerGroup key={key}>
              <GeoJSON
                key={item.properties.id}
                data={item}
                pathOptions={{ 
                  color: item.properties.color,
                  opacity: isHovered ? 1 : 0.8,
                  weight: isHovered ? 4 : 2,
                  fillOpacity: isHovered ? 0.6 : 0.3
                }}
                eventHandlers={{
                  click: (e) => {
                    // При клике на поле на карте - открываем модальное окно
                    if (onFieldClick) {
                      onFieldClick(item);
                    }
                  },
                }}
              >
                <Tooltip key={`${item.properties.id}-${tooltipKey}`} permanent={false} sticky={false}>
                  <Typography>
                    {item.properties.crop 
                      ? item.properties.crop.charAt(0).toUpperCase() + item.properties.crop.slice(1)
                      : item.properties.name || 'Поле'}
                  </Typography>
                  <Typography>{item.properties.area} га</Typography>
                  {
                    item.properties?.productivity_value && <Typography>Урожайность (физ.вес) - {Math.round(item.properties?.productivity_value)} ц/га</Typography>
                  }
                </Tooltip>
              </GeoJSON>
            </LayerGroup>
          );
        })}
    </>
  );
});
export default Layers;
