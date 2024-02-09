import React, { memo, useEffect } from "react";
import {
  TileLayer,
  LayersControl,
  useMapEvents,
  GeoJSON,
  LayerGroup,
  Tooltip,
} from "react-leaflet";
import { Typography } from "@mui/material";

const Layers = memo(({ layer, activeArea, setActiveArea }) => {
  const map = useMapEvents({
    // Use leaflet map event as the key and a call back with the
    // map method as the value:
    zoomend: () => {
      // Get the zoom level once zoom ended:
      console.log(map.getZoom());
    },
    moveend: () => {
      // Get bounds once move has ended:
      // console.log(map.getBounds());
    },
    // click: (e) => {
    //   map.setView(e.latlng, map.getZoom(), {
    //     animate: true,
    //   })
    // },
  });

  useEffect(() => {
    if (layer) {
      map.setView([layer.center[1], layer.center[0]], map.getZoom());
    }
  }, [layer]);

  useEffect(() => {
    if (activeArea) {
      map.fitBounds(
        activeArea.geometry.coordinates[0].map((item) => item.reverse())
      );
      activeArea.geometry.coordinates[0].map((item) => item.reverse());
      setActiveArea(null);
    }
  }, [activeArea]);

  const hashString = (str) => {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < Math.min(str.length, 255); i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };


  return (
    <>
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Basic Map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
            ext="png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Topo Map">
          <TileLayer
            attribution='Map data: &amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &amp;copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="WorldImagery">
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
        {layer &&
          layer.features.map((item, key) => {
            return (
              <LayerGroup key={key}>
                <GeoJSON
                  key={hashString(JSON.stringify(layer))}
                  data={item}
                  pathOptions={{ color: item.properties.crop_color }}
                  eventHandlers={{
                    click: (event, type) => {
                      map.fitBounds(
                        item.geometry.coordinates[0].map((item) =>
                          item.reverse()
                        )
                      );
                      item.geometry.coordinates[0].map((item) =>
                        item.reverse()
                      );
                    },
                  }}
                >
                  <Tooltip sticky>
                    <Typography>
                      {item.properties.crop.charAt(0).toUpperCase() +
                        item.properties.crop.slice(1)}
                    </Typography>
                    <Typography>{item.properties.area} га</Typography>
                  </Tooltip>
                </GeoJSON>
              </LayerGroup>
            );
          })}
      </LayersControl>
    </>
  );
});
export default Layers;
