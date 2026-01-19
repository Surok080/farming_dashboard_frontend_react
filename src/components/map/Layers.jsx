import React, {memo, useEffect, useState} from "react";
import {GeoJSON, LayerGroup, LayersControl, TileLayer, Tooltip, useMap} from "react-leaflet";
import {Typography} from "@mui/material";

const Layers = memo(({ layer, activeArea, setActiveArea, year, onFieldClick, isModalOpen, hoveredFieldId, hideLayerControl = false }) => {
  const [tooltipKey, setTooltipKey] = useState(0);
  const map = useMap();

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


  useEffect(() => {
    if (layer && layer?.features?.length) {
      map.setView([layer.center[1], layer.center[0]], map.getZoom());
    }
  }, [layer, map]);

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
