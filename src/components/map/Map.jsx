import React, { useEffect, useState } from "react";
import Layers from "./Layers";
import { MapContainer, ZoomControl, Rectangle } from "react-leaflet";
import ReactLeafletKml from "react-leaflet-kml";
import * as tj from "@mapbox/togeojson";
import rewind from "@mapbox/geojson-rewind";
import test2 from "../map.json";
import { httpService } from "../../api/setup";
import { Box, Button, List, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Map = () => {
  const [layer, setLayer] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("map")) {
      try {
        console.log(JSON.parse(sessionStorage.getItem("map")));
        setLayer(JSON.parse(sessionStorage.getItem("map")));
      } catch {
        sessionStorage.setItem("map", null);
      }
    }
  }, []);

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
      sessionStorage.setItem("map", JSON.stringify(res.data));
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
      {layer ? (
        <Button
          variant="contained"
          sx={{ position: "absolute", top: "5px", zIndex: '10000' }}
          onClick={() => {
            console.log("delete");
            sessionStorage.setItem("map", null);
            setLayer(null);
          }}
        >
          Удалить карты
        </Button>
      ) : (
        <Button
          sx={{ position: "absolute", top: "5px", zIndex: '10000' }}
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onChange={handleFileSelection}
        >
          Загрузить файл
          <VisuallyHiddenInput type="file" />
        </Button>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          position: "relative",
          height: '100%'
        }}
      >
        <input style={{ position: "absolute" }} type="file" />
        <MapContainer
          center={[56.66163543086128, 54.6566711425781]}
          zoom={12}
          zoomControl={true}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          <ZoomControl position="topright" />
          <Layers layer={layer} />
          {layer ? (
            <Box
              sx={{
                position: "absolute",
                right: "5px",
                bottom: "20px",
                width: "200px",
                height: "180px",
                zIndex: "1000",
                background: "#ffffffed",
                borderRadius: "10px",
                overflowX: "hidden",
                overflowY: 'scroll',
                padding: '10px'
              }}
            >
              <Typography>Легенда</Typography>
              {layer.features.map((item, key) => {
                return (
                  <Typography variant="caption">
                    {item.properties.crop_group}
                  </Typography>
                );
              })}
            </Box>
          ) : null}
        </MapContainer>
      </div>
    </>
  );
};

export default Map;
