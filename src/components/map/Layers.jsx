import React, { memo, useEffect } from "react";
import {
  TileLayer,
  LayersControl,
  useMapEvents,
  GeoJSON,
  LayerGroup,
  Tooltip,
} from "react-leaflet";
import {Typography } from "@mui/material";


const Layers = memo(({ layer, activeArea,  setActiveArea}) => {
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
        activeArea.geometry.coordinates[0].map((item) =>
          item.reverse()
        )
      );
      activeArea.geometry.coordinates[0].map((item) =>
        item.reverse()
      );
      setActiveArea(null)
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
    // console.log(hash);
    return hash;
  };

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <>
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Basic Map">
          <TileLayer
            attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}"
            ext="png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Topo Map">
          <TileLayer
            attribution='Map data: &amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &amp;copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        {layer &&
          layer.features.map((item, key) => {

            return (
              /* <LayersControl.Overlay
                key={key}
                checked
                name={item.properties.crop + " - " + item.properties.name}
                onClick={() => console.log("item.properties")}
              > */
                <LayerGroup>
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
                      }
                    }}
                  >
                    <Tooltip sticky>
                      <Typography>{item.properties.crop.charAt(0).toUpperCase() + item.properties.crop.slice(1)}</Typography>
                      {/* <Typography>{item.properties.area.split('.')[0]} га</Typography> */}
                    </Tooltip>
                  </GeoJSON>
                </LayerGroup>
              /* </LayersControl.Overlay> */
            );
          })}
      </LayersControl>
    </>
  );
});
export default Layers;
