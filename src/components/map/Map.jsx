import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import Layers from "./Layers";
import { MapContainer, ZoomControl } from "react-leaflet";
import * as tj from "@mapbox/togeojson";
import rewind from "@mapbox/geojson-rewind";
import test2 from "../map.json";
import { httpService } from "../../api/setup";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemButton,
  Tab,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import List from "@mui/material/List";
import { Chart } from "react-google-charts";
import { useSnackbar } from "notistack";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { TabContext, TabList, TabPanel } from "@mui/lab";

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

const Map = memo(({ year }) => {
  const [layer, setLayer] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [activeArea, setActiveArea] = useState(null);
  const [deleteIdArea, setDeleteIdArea] = useState(null);
  const [colorLayers, setColorLayers] = useState([]);
  const fileInputRef = useRef(null);
  const [load, setLoad] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [value, setValue] = React.useState("1");
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);

  const handleOpenConfirmDelete = () => {
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (!load) {
      getData();
      setLoad(true);
    }
  }, [year]);

  const options = {
    title: "Структура посевов (га)",
    legend: {
      position: "right",
      alignment: "center",
      orientation: "vertical",
    }, // Размещение легенды
    chartArea: { left: 20, top: 100, width: "100%", height: "50%" }, // Управление областью рисования диаграммы
    pieSliceText: "value",
    pieHole: 0.4,
    is3D: false,
    colors: colorLayers.map((item) => item.color),
  };

  const getData = () => {
    httpService
      .get(`/data/fields?year=${year}`)
      .then((res) => {
        if (res.status === 200) {
          setLayer(res.data);
          getAreaLayers(res.data);
          getColorLayers(res.data);
        } else {
          resetState();
        }
      })
      .finally(() => {
        setLoad(false);
      });
  };

  const resetState = () => {
    setLayer(null);
    setStatistics([]);
    setActiveArea(null);
    setColorLayers([]);
  };

  const handleFileSelection = (event) => {
    console.log("testt");

    const file = event.target.files[0]; // get file
    const ext = getFileExtension(file);
    const reader = new FileReader();

    let formData = new FormData();
    formData.append("file", file);

    httpService
      .post("/data/upload_file/", formData)
      .then((res) => {
        if (res.status === 200) {
          getData();
          enqueueSnackbar("Данные добавлены", {
            autoHideDuration: 1000,
            variant: "success",
          });
        } else if (res.status === 422) {
          enqueueSnackbar("Некорректный файл", {
            autoHideDuration: 1000,
            variant: "error",
          });
        } else {
          enqueueSnackbar("Ошибка загрузки файлов", {
            autoHideDuration: 1000,
            variant: "error",
          });
        }
      })
      .finally(() => {
        fileInputRef.current.value = null;
      });
  };

  const deletArea = () => {
    if (deleteIdArea) {
      httpService
        .delete(`/data/fields/${deleteIdArea}`)
        .then((res) => {
          if (res.status === 200) {
            getData();
            enqueueSnackbar("Поле успешно удалено", {
              autoHideDuration: 1000,
              variant: "success",
            });
          } else {
            enqueueSnackbar("Ошибка удаления поля", {
              autoHideDuration: 1000,
              variant: "error",
            });
          }
        })
        .catch((e) => {
          enqueueSnackbar("Ошибка удаления поля", {
            autoHideDuration: 1000,
            variant: "error",
          });
        })
        .finally(() => {
          handleCloseConfirmDelete();
        });
    }
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
          color: item.properties.crop_color,
        });
      }
    });

    setColorLayers(colorsLayers);
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
        <VisuallyHiddenInput type="file" ref={fileInputRef} />
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
            height: "auto",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              width: "100%",
              typography: "body1",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <TabContext value={value}>
              {/* <Box sx={{ borderBottom: 1, borderColor: 'red' }}> */}
              <TabList
                centered
                textColor="primary"
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Поля" value="1" />
                <Tab label="Структура" value="2" />
                <Tab label="Отчет" value="3" />
              </TabList>
              {/* </Box> */}
              <TabPanel
                sx={{
                  height: "100%",
                  overflowY: "scroll",
                  maxHeight: "100%",
                  paddingBottom: "50px",
                }}
                value="1"
              >
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  overflow={"hidden"}
                >
                  {layer ? (
                    <List
                      sx={{
                        width: "100%",
                        height: "100%",

                        bgcolor: "background.paper",
                      }}
                    >
                      {layer.features.map((item, index) => {
                        const svgString = item.properties.svg.replace(
                          'stroke-width="40"',
                          'stroke-width="30"'
                        );
                        return (
                          <ListItemButton
                            key={index}
                            style={{
                              width: "100%",
                              display: "flex",
                              gap: "10px",
                              height: "100px",
                              padding: "0",
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
                              style={{
                                width: "100%",
                                maxWidth: "70px",
                                height: "70px",
                              }}
                              dangerouslySetInnerHTML={{ __html: svgString }}
                            />
                            <Box display={"flex"} flexDirection={"column"}>
                              <Typography variant="body2">
                                {item.properties.crop}
                              </Typography>
                              <Typography variant="caption">
                                {item.properties.crop_kind}
                              </Typography>
                              <Typography variant="caption">
                                {item.properties.name}
                              </Typography>
                            </Box>
                            <Typography variant="caption">
                              {item.properties.area} га
                            </Typography>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                // e.preventDefault()
                                setDeleteIdArea(item.properties.id);
                                handleOpenConfirmDelete();
                              }}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </ListItemButton>
                        );
                      })}
                    </List>
                  ) : (
                    <p>Нет данных</p>
                  )}
                </Box>
              </TabPanel>
              <TabPanel value="2">
                <Box>
                  {statistics.length ? (
                    <Chart
                      chartType="PieChart"
                      width="100%"
                      height="650px"
                      data={statistics}
                      options={options}
                      // style={{ display: "flex", justifyContent: "space-between" }}
                    />
                  ) : null}
                </Box>
              </TabPanel>
              <TabPanel value="3">Отчет скоро появится</TabPanel>
            </TabContext>
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
                    const color =
                      colorLayers.find((layer) => layer.name === item[0])
                        ?.color ?? "red";

                    return (
                      <Box
                        alignItems={"center"}
                        alignContent={"center"}
                        display={"flex"}
                        gap={"4px"}
                      >
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
      <Dialog
        open={openConfirmDelete}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Вы уверны что хотите удалить это поле?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Поле удалится безвозвратно, вы уверены что хотите это сделать?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={handleCloseConfirmDelete}
          >
            Отмена
          </Button>
          <Button variant="contained" onClick={deletArea} autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default Map;
