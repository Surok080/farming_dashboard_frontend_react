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
import { httpService } from "../../api/setup";
import { Button } from "@mui/material";
import { styled } from '@mui/material/styles';


import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Map = () => {
  const [layer, setLayer] = useState(null);

  const handleFileSelection = (event) => {
    const file = event.target.files[0]; // get file
    console.log(file);
    const ext = getFileExtension(file);
    const reader = new FileReader();

    let formData = new FormData();
    formData.append("file", file);

    httpService.post("/data/upload_file/", formData).then((res) => {
      console.log(" Эталонный файл ", test2);
      console.log(" Импортируемый файл ", res.data);
      setLayer(res.data);
    });
    // reader.onloadend = (event) => {
    //   var text = event.target.result;
    //   if (ext === "kml") {
    //     parseTextAsKml(text);
    //   } else {
    //     // imported geojson
    //     const json = JSON.parse(text);
    //     rewind(json, false);
    //     console.log(json);
    //     setLayer(json);
    //   }
    // };

    // reader.readAsText(file); // start reading file
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
    <>
      <Button
      sx={{position: 'absolute', bottom: '-50px'}}
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onChange={handleFileSelection}
      >
        Загрузить файл
        <VisuallyHiddenInput type="file" />
      </Button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          position: "relative",
        }}
      >
        <input style={{ position: "absolute" }} type="file" />
        <MapContainer
          center={[56.66163543086128, 54.6566711425781]}
          zoom={12}
          zoomControl={true}
          scrollWheelZoom={true}
          style={{ height: "500px", width: "100%" }}
        >
          <ZoomControl position="topright" />
          <Layers layer={layer} />
        </MapContainer>
      </div>
    </>
  );
};

export default Map;
