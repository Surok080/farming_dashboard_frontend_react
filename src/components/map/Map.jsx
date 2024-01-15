import React, { useEffect, useState } from "react";
import Layers from "./Layers";
import { MapContainer, ZoomControl } from "react-leaflet";
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
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";
import WorkIcon from "@mui/icons-material/Work";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";

const data = [
  { value: 5, label: "Пшеница яровая" },
  { value: 10, label: "Пшеница озимая" },
  { value: 15, label: "Люцерна " },
  { value: 20, label: "Рапс яровой" },
];

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
          sx={{ position: "absolute", top: "5px", zIndex: "10000" }}
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
          sx={{ position: "absolute", top: "5px", zIndex: "10000" }}
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
          <Layers layer={layer} />
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
            <AccordionDetails             sx={{
   
              height: '100%'
            }}>
              <Box>
                <PieChart
                  series={[
                    {
                      arcLabel: (item) => ``,
                      arcLabelMinAngle: 45,
                      innerRadius: 37,
                      outerRadius: 56,
                      paddingAngle: 0,
                      cornerRadius: 2,
                      startAngle: 0,
                      endAngle: 360,
                      cx: 55,
                      cy: 95,
                      data,
                    },
                  ]}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: "white",
                      fontWeight: "bold",
                    },
                  }}
                  width={350}
                  height={200}
                />
              </Box>
              <Box>
                <List
                  sx={{
                    width: "100%",
                    height: '400px',
                    overflowY: 'scroll',
                    maxWidth: 360,
                    bgcolor: "background.paper",
                  }}
                >
                  {layer ? (
                    layer.features.map((item, index) => {
                      console.log(item);
                      const svgString = item.properties.svg.replace('stroke-width="100"', 'stroke-width="50"');
                      return (
                        <ListItem
                          key={index}
                          style={{ width: "100%", display: 'flex', gap: '10px' }}
                        >
                          {/* <div
                          className="svgTest"
                            style={{ width: "100px", height: "100%" }}
                            dangerouslySetInnerHTML={{ __html: svgString }}
                          /> */}
                          <svg style={{ width: '150px', height: '100%' }} dangerouslySetInnerHTML={{ __html: svgString }} />
                          <Typography variant="subtitle1">{item.properties.crop}</Typography>
                          <Typography>{item.properties.area.split('.')[0]} га</Typography>
                        </ListItem>
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
