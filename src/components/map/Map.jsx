import React, { useMemo, useState } from "react";
import Layers from "./Layers";
import {
  TileLayer,
  LayersControl,
  useMap,
  useMapEvents,
  Marker,
  GeoJSON,
  MapContainer,
  ZoomControl,
  Rectangle,
} from "react-leaflet";
import ReactLeafletKml from "react-leaflet-kml";
import * as tj from "@mapbox/togeojson";
import rewind from "@mapbox/geojson-rewind";
import test2 from "../map.json";

const Map = () => {
  const [layer, setLayer] = useState(null);

  const handleFileSelection = (event) => {
    const file = event.target.files[0]; // get file
    console.log(file);
    const ext = getFileExtension(file);
    const reader = new FileReader();

    // on load file end, parse the text read
    reader.onloadend = (event) => {
      var text = event.target.result;
      if (ext === "kml") {
        parseTextAsKml(text);
      } else {
        // imported geojson
        const json = JSON.parse(text);
        rewind(json, false);
        console.log(json);
        setLayer(json);
      }
    };

    reader.readAsText(file); // start reading file
  };

  const parseTextAsKml = (text) => {
    const dom = new DOMParser().parseFromString(text, "text/xml"); // create xml dom object
    const converted = tj.kml(dom); // convert xml dom to geojson
    rewind(converted, false); // correct right hand rule
    console.log(converted, " converted");
    console.log(test2);
    setLayer(converted); // save converted geojson to hook state
  };

  const getFileExtension = (file) => {
    const name = file.name;
    const lastDot = name.lastIndexOf(".");
    return name.substring(lastDot + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <input type="file" onChange={handleFileSelection} />
      <MapContainer
        center={[56.66163543086128, 54.6566711425781]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: "500px", width: "100%" }}
      >
        <ZoomControl position="topright" />
        <Layers layer={layer} />
      </MapContainer>
    </div>
  );
};

export default Map;
