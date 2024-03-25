import React, { memo, useEffect, useRef, useState } from "react";
import Layers from "./Layers";
import { MapContainer, ZoomControl } from "react-leaflet";
import { httpService } from "../../api/setup";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Chart } from "react-google-charts";
import { useSnackbar } from "notistack";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ListArea from "./ListArea";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import {
  getAreaLayers,
  getColorLayers,
  getOptionChart,
} from "../../utils/mapUtils";
import ReportArea from "./ReportArea";
import LayersState from "./LayersState";
import ReportAreaState from "./ReportAreaState";
import LayersCartogram from "./LayersCartogram";
import ReportAreaCartogram from "./ReportAreaCartogram";

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

const MapCartogram = memo(() => {
  const [layer, setLayer] = useState([]);
  const [layerSearch, setLayerSearch] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [activeArea, setActiveArea] = useState(null);
  const [deleteIdArea, setDeleteIdArea] = useState(null);
  const [colorLayers, setColorLayers] = useState([]);
  const fileInputRef = useRef(null);
  const [load, setLoad] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [value, setValue] = React.useState("1");
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [serachValue, setSerachValue] = useState(false);
  const [grouping, setGrouping] = useState("phosphorus_group_id");

  useEffect(() => {
    if (!load) {
      getData();
      setLoad(true);
    }
  }, [grouping]);
  

  useEffect(() => {
    if (serachValue && layer) {
      setLayerSearch(
        layer.features.filter((item) =>
          item.properties.plot_сadastral_number.includes(serachValue)
        )
      );
    } else if (layer) {
      setLayerSearch(layer.features);
    }
  }, [serachValue, layer]);

  const handleChangeGrouping = (event) => {
    setGrouping(event.target.value);
  };

  const handleOpenConfirmDelete = () => {
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getData = () => {
    httpService
      .get(`/cartogram/fields?group=phosphorus`)
      .then((res) => {
        if (res?.status === 200 && res.data?.features) {
          setLayer(res.data);
          getAreaLayers(res.data, setStatistics, grouping);
          getColorLayers(res.data, setColorLayers, grouping);
        } else {
          resetState();
        }
      })
      .finally(() => {
        setLoad(false);
      });
  };

  const resetState = () => {
    setLayer([]);
    setStatistics([]);
    setActiveArea(null);
    setColorLayers([]);
  };

  const handleFileSelection = (event) => {
    const file = event.target.files[0]; // get file

    let formData = new FormData();
    formData.append("file", file);

    httpService
      .post("/cartogram/upload_cartogram", formData)
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
        .delete(`/state_monitoring/plots/${deleteIdArea}`)
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

  return (
    <>
      <Button
        sx={{
          position: "absolute",
          top: "150px",
          zIndex: "1000",
          right: "10px",
          maxWidth: "40px",
          minWidth: "40px",
        }}
        component="label"
        variant="contained"
        onChange={handleFileSelection}
      >
        <CloudUploadIcon />
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
                <Tab label="Слои" value="1" />
                <Tab label="Свойства" value="2" />
              </TabList>
              {/* </Box> */}
              <TabPanel
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "97%",
                  // padding: "20px 10px",
                  // gap: '10px',
                  // height: '100%'
                }}
                value="1"
              >
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    По типу
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={grouping}
                    label="По типу"
                    onChange={handleChangeGrouping}
                    size="small"
                  >
                    <MenuItem value={"phosphorus_group_id"}>
                      Подвижный фосфор
                    </MenuItem>
                    <MenuItem value={"phosphorus_group_id"}>Калий</MenuItem>
                  </Select>
                </FormControl>
              </TabPanel>
              <TabPanel
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "90%",
                  paddingBottom: "0px",
                  marginTop: "-40px",
                }}
                value="2"
              >
                <ReportAreaCartogram grouping={grouping}/>
              </TabPanel>
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
          {layer ? (
            <LayersCartogram
              layer={layer}
              activeArea={activeArea}
              setActiveArea={setActiveArea}
            />
          ) : null}
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
                gap: '5px'
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
                        key={key}
                        alignItems={"baseline"}
                        alignContent={"center"}
                        display={"flex"}
                        gap={"4px"}
                      >
                        <Box
                          sx={{
                            width: "10px",
                            height: "10px",
                            background: color,
                            minWidth: "10px",
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
      <ConfirmDeleteModal
        deletArea={deletArea}
        handleCloseConfirmDelete={handleCloseConfirmDelete}
        openConfirmDelete={openConfirmDelete}
      />
    </>
  );
});

export default MapCartogram;
