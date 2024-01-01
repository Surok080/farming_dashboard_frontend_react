import React, { memo, useEffect, useState } from "react";
import {
  TileLayer,
  LayersControl,
  useMap,
  useMapEvents,
  Marker,
  GeoJSON,
  Popup,
  LayerGroup,
  Tooltip,
} from "react-leaflet";
import * as tj from "@mapbox/togeojson";
import rewind from "@mapbox/geojson-rewind";
import L from "leaflet";
import { Box, Divider, Typography } from "@mui/material";

const Layers = memo(({ layer }) => {
  const map = useMapEvents({
    // Use leaflet map event as the key and a call back with the
    // map method as the value:
    zoomend: () => {
      // Get the zoom level once zoom ended:
      console.log(map.getZoom());
    },
    moveend: () => {
      // Get bounds once move has ended:
      console.log(map.getBounds());
    },
    click: (e) => {},
  });

  useEffect(() => {
    if (layer) {
      map.setView([layer.center[1], layer.center[0]], map.getZoom());
    }
  }, [layer]);

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
            console.log(item);
            return (
              <LayersControl.Overlay
                key={key}
                checked
                name={item.properties.crop + " - " + item.properties.name}
                onClick={() => console.log("item.properties")}
              >
                <LayerGroup>
                  <GeoJSON
                    key={hashString(JSON.stringify(layer))}
                    data={item}
                    pathOptions={{ color: getRandomColor() }}
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
                      <Typography>{item.properties.area} Га</Typography>
                      <Typography>{item.properties.crop.charAt(0).toUpperCase() + item.properties.crop.slice(1)}</Typography>
                    </Tooltip>
                  </GeoJSON>
                </LayerGroup>
              </LayersControl.Overlay>
            );
          })}
      </LayersControl>
      {/* <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {layer && (
            <GeoJSON key={hashString(JSON.stringify(layer))} data={layer} />
          )}
      <input type="file" onChange={handleFileSelection} /> */}
    </>
  );
});
export default Layers;
