import React, { useEffect, useState } from "react";
import Layers from "./Layers";
import { MapContainer, ZoomControl } from "react-leaflet";
import * as tj from "@mapbox/togeojson";
import rewind from "@mapbox/geojson-rewind";
import test2 from "../map.json";
import { httpService } from "../../api/setup";
import { Box, Button, ListItemButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import List from "@mui/material/List";
import { Chart } from "react-google-charts";



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
  const [colorLayers, setColorLayers] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const options = {
    title: "Структура посевов (га)",
    legend: { position: "right" }, // Размещение легенды справа от диаграммы
    chartArea: { left: 20, top: 30, width: "100%", height: "80%" }, // Управление областью рисования диаграммы
    pieSliceText: "value",
    pieHole: 0.4,
    is3D: false,
    colors: colorLayers.map(item => item.color)
  };

  const getData = () => {
    httpService.get("/data/fields").then((res) => {
      if (res.status !== 404) {
        setLayer(res.data);
        getAreaLayers(res.data);
        getColorLayers(res.data);
      }
    });
  };

  const handleFileSelection = (event) => {
    const file = event.target.files[0]; // get file
    const ext = getFileExtension(file);
    const reader = new FileReader();

    let formData = new FormData();
    formData.append("file", file);

    httpService.post("/data/upload_file/", formData).then((res) => {
      if (res.status === 200) {
        getData();
      }
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
    const graphStatics = [["Поле", "Площадь"]];

    layers.features.map((item, index) => {
      if (graphStatics.find((area) => area[0] === item.properties.crop)) {
        graphStatics.map((area) => {
          if (area[0] === item.properties.crop) {
            area[1] = +parseFloat(
              area[1] + +parseFloat(item.properties.area).toFixed(1)
            ).toFixed(1);
          }
        });
      } else {
        graphStatics.push([
          item.properties.crop,
          +parseFloat(item.properties.area).toFixed(1),
        ]);
      }
    });

    setStatistics(graphStatics);
  };

  const getColorLayers = (layers) => {
    let colorsLayers = [];

    layers.features.map((item, index) => {
      if (colorsLayers.find((layer) => layer.name === item.properties.crop)) {
      } else {
        colorsLayers.push({
          name: item.properties.crop,
          color: item.properties.crop_color
        });
      }
    });

    setColorLayers(colorsLayers)
  }

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
          width: "100%",
          position: "relative",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            height: "calc(100vh - 85px)",
            bgcolor: "background.paper",
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography>Список полей</Typography>
          <Box>
            {statistics ? (
              <Chart
                chartType="PieChart"
                width="100%"
                height="350px"
                data={statistics}
                options={options}
                style={{ display: "flex", justifyContent: "space-between" }}
              />
            ) : null}
          </Box>
          <Box display={'flex'} flexDirection={'column'} overflow={'hidden'}>
            <List
              sx={{
                width: "100%",
                height: "100%",
                overflowY: "scroll",
                bgcolor: "background.paper",
              }}
            >
              {layer ? (
                layer.features.map((item, index) => {
                  const svgString = item.properties.svg.replace(
                    'stroke-width="40"',
                    'stroke-width="30"'
                  );
                  console.log(item);
                  
                  return (
                    <ListItemButton
                      key={index}
                      style={{
                        width: "100%",
                        display: "flex",
                        gap: "10px",
                        height: '100px',
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
                      <svg
                        style={{ width: "100%", maxWidth: '70px', height: "70px" }}
                        dangerouslySetInnerHTML={{ __html: svgString }}
                      />
                      <Box display={'flex'} flexDirection={'column'}>
                      <Typography variant="body2">
                        {item.properties.crop}
                      </Typography>
                      <Typography variant="body2">
                        {item.properties.crop_group}
                      </Typography>
                      <Typography variant="body2">
                        {item.properties.name}
                      </Typography>
                      </Box>
                      
                      <Typography variant="body2">{item.properties.name} га</Typography>
                    </ListItemButton>
                  );
                })
              ) : (
                <p>Нет данных</p>
              )}
            </List>
          </Box>
        </Box>
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
              width: "170px",
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {statistics &&
                statistics.map((item, key) => {
                  if (key > 0) {
                    const color = colorLayers.find((layer) => layer.name === item[0])?.color ?? 'red';
                    
                    return (
                      <Box alignItems={'center'} alignContent={'center'} display={'flex'} gap={'4px'}>
                        <Box
                          sx={{
                            width: "10px",
                            height: "10px",
                            background: color,
                          }}
                        ></Box>
                        <Typography align="left" variant="caption">
                          {item[0]}
                        </Typography>
                      </Box>
                    );
                  }
                })}
            </Box>
          </Box>
        ) : null}
      </div>
    </>
  );
};

export default Map;
