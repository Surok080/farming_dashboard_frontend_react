import React, { useState } from "react";
import {
  TileLayer,
  LayersControl,
  useMap,
  useMapEvents,
  Marker,
  GeoJSON,
  Popup,
  LayerGroup,
} from "react-leaflet";
import ReactLeafletKml from "react-leaflet-kml";
import * as tj from "@mapbox/togeojson";
import rewind from "@mapbox/geojson-rewind";
import L from "leaflet";
import { Divider, Typography } from "@mui/material";

const Layers = ({ layer }) => {
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
  });

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
  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // const getMarkerPosition = (state_name) => {
  //   switch (state_name) {
  //     case "Montana":
  //       // Use L.latLng to create latLng object.
  //       // { "lat": LATITUDE, "lng": LONGITUDE }
  //       return L.latLng(46.8797, -110.3626);
  //     case "Wyoming":
  //       return L.latLng(43.076, -107.2903);
  //     case "North Dakota":
  //       return L.latLng(47.5515, -101.002);
  //     case "South Dakota":
  //       return L.latLng(43.9695, -99.9018);
  //     default:
  //       return;
  //   }
  // };
  return (
    <>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Basic Map">
          <TileLayer
            attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}"
            ext="png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Topo Map">
          <TileLayer
            attribution='Map data: &amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &amp;copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        {layer &&
          layer.features.map((item, key) => {


            // Находим среднее значение координат X и Y
            let centerX = 0;
            let centerY = 0;

            for (let i = 0; i < item.geometry.coordinates[0].length; i++) {
              centerX += item.geometry.coordinates[0][i][0];
              centerY += item.geometry.coordinates[0][i][1];
            }

            centerX = centerX / item.geometry.coordinates[0].length;
            centerY = centerY / item.geometry.coordinates[0].length;

            // Получаем координаты центра полигона
            console.log("Центр полигона: (" + centerX + ", " + centerY + ")");

            return (
              <LayersControl.Overlay
                key={key}
                checked
                name={item.properties["Наим �_1"]}
              >
                <LayerGroup>
                  <GeoJSON
                    key={hashString(JSON.stringify(layer))}
                    data={item}
                    pathOptions={{ color: getRandomColor() }}
                  >
                    <Marker position={[centerY, centerX]}>
                      <Popup>
                        <Typography variant="subtitle2">
                          {item.properties["Наим �_1"]}
                        </Typography>
                        <Divider />
                        <Typography variant="body2" style={{ margin: 3 }}>
                        {item.properties["Наим �"]}
                      </Typography>
                      <Typography variant="body2" style={{ margin: 3 }}>
                      {item.properties["Наиме"]}
                      </Typography>
                      </Popup>
                    </Marker>
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
};
export default Layers;
