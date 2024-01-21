import React, { useEffect, useState } from "react";
import Layers from "./Layers";
import { MapContainer, ZoomControl, useMapEvents } from "react-leaflet";
import * as tj from "@mapbox/togeojson";
import rewind from "@mapbox/geojson-rewind";
import test2 from "../map.json";
import { httpService } from "../../api/setup";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ListItemButton,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Chart } from "react-google-charts";

export const data12 = [
  ["Task", "Hours per Day"],
  ["Work", 11],
  ["Eat", 2],
  ["Commute", 2],
  ["Watch TV", 2],
  ["Sleep", 7],
  ["Work", 11],
  ["Eat", 2],
  ["Commute", 2],
  ["Watch TV", 2],
  ["Sleep", 7],
  ["Work", 11],
  ["Eat", 2],
  ["Commute", 2],
  ["Watch TV", 2],
  ["Sleep", 7],
  ["Work", 11],
  ["Eat", 2],
  ["Commute", 2],
  ["Watch TV", 2],
  ["Sleep", 7],
];

export const options = {
  title: "Бирюли",
  legend: { position: "right",  }, // Размещение легенды справа от диаграммы
  chartArea: { left: 0, top: 20, width: "100%", height: "80%" }, // Управление областью рисования диаграммы
  pieHole: 0.4,
  is3D: false,
};

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
  const [statistics, setStatistics] = useState([]);
  const [activeArea, setActiveArea] = useState(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    httpService.get("/data/fields").then((res) => {
      console.log(res);
      if (res.status !== 404) {
        console.log(res.data);
        setLayer(res.data);
        getAreaLayers(res.data);
      }
    });
    // if (sessionStorage.getItem("map")) {
    //   try {
    //     console.log(JSON.parse(sessionStorage.getItem("map")));
    //     setLayer(JSON.parse(sessionStorage.getItem("map")));
    //     getAreaLayers(JSON.parse(sessionStorage.getItem("map")));
    //   } catch {
    //     sessionStorage.setItem("map", null);
    //   }
    // }
  };

  const handleFileSelection = (event) => {
    const file = event.target.files[0]; // get file
    console.log(file);
    const ext = getFileExtension(file);
    const reader = new FileReader();

    let formData = new FormData();
    formData.append("file", file);

    httpService.post("/data/upload_file/", formData).then((res) => {
      if (res.status === 200) {
        getData();
        console.log(res);
      }
      // console.log(" Эталонный файл ", test2);
      // console.log(" Импортируемый файл ", res.data);
      // sessionStorage.setItem("map", JSON.stringify(res.data));
    });
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

  const getAreaLayers = (layers) => {
    const graphStatics = [["Task", "Hours per Day"]];

    layers.features.map((item, index) => {
      if (graphStatics.find((area) => area[0] === item.properties.crop)) {
        graphStatics.map((area) => {
          if (area[0] === item.properties.crop) {
            area[1] = +parseFloat(
              area[1] + +parseFloat(item.properties.area).toFixed(1)
            ).toFixed(1);
          }
        });
        // graphStatics.find(area => area.name === item.properties.crop).area = +parseFloat(graphStatics.find(area => area.name === item.properties.crop).area + item.properties.area).toFixed(1);
      } else {
        graphStatics.push([
          item.properties.crop,
          +parseFloat(item.properties.area).toFixed(1),
        ]);
      }
    });

    setStatistics(graphStatics);
  };

  return (
    <>
      <Button
        sx={{ position: "absolute", top: "5px", zIndex: "10000" }}
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
          height: "100%",
        }}
      >
        <input style={{ position: "absolute" }} type="file" />
        <MapContainer
          center={[56.66163543086128, 54.6566711425781]}
          zoom={12}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          <ZoomControl position="topright" />
          <Layers
            layer={layer}
            activeArea={activeArea}
            setActiveArea={setActiveArea}
          />
        </MapContainer>
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
              overflowY: "scroll",
              padding: "10px",
            }}
          >
            <Typography>Легенда</Typography>
            {layer.features.map((item, key) => {
              return (
                <Typography variant="caption">
                  {item.properties.crop}
                </Typography>
              );
            })}
          </Box>
        ) : null}
        <Box
          sx={{
            position: "absolute",
            left: "0px",
            top: "0px",
            zIndex: "1000",
          }}
        >
          <Accordion
            sx={{
              width: "450px",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography>Список полей</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                height: "100%",
              }}
            >
              <Box>
                {statistics ? (
                  <Chart
                    chartType="PieChart"
                    width="100%"
                    height="250px"
                    data={statistics}
                    options={options}
                    style={{display: 'flex', justifyContent: 'space-between'}}
                  />
                ) : null}
              </Box>
              <Box>
                <List
                  sx={{
                    width: "100%",
                    height: "400px",
                    overflowY: "scroll",
                    bgcolor: "background.paper",
                  }}
                >
                  {layer ? (
                    layer.features.map((item, index) => {
                      const svgString = item.properties.svg.replace(
                        'stroke-width="100"',
                        'stroke-width="50"'
                      );
                      return (
                        <ListItemButton
                          key={index}
                          style={{
                            width: "100%",
                            display: "flex",
                            gap: "10px",
                            justifyContent: "space-between",
                            "&:hover": {
                              backgroundColor: "blue",
                              color: "white",
                              "& .MuiListItemIcon-root": {
                                color: "white",
                              },
                            },
                          }}
                          onClick={() => {
                            setActiveArea(item);
                          }}
                        >
                          {/* <div
                          className="svgTest"
                            style={{ width: "100px", height: "100%" }}
                            dangerouslySetInnerHTML={{ __html: svgString }}
                          /> */}
                          <svg
                            style={{ width: "100px", height: "100px" }}
                            dangerouslySetInnerHTML={{ __html: svgString }}
                          />
                          <Typography variant="subtitle1">
                            {item.properties.crop}
                          </Typography>
                          <Typography>{item.properties.area} га</Typography>
                        </ListItemButton>
                      );
                    })
                  ) : (
                    <p>Нет данных</p>
                  )}
                </List>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </div>
    </>
  );
};

export default Map;
