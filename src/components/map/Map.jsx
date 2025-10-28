import React, {memo, useEffect, useState} from "react";
import Layers from "./Layers";
import {MapContainer, ZoomControl} from "react-leaflet";
import {httpService} from "../../api/setup";
import {
    Backdrop,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Tab,
    TextField,
    Typography, useMediaQuery, useTheme,
} from "@mui/material";
import {Chart} from "react-google-charts";
import {useSnackbar} from "notistack";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import ListArea from "./ListArea";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { TelemetryModal, SatelliteModal } from "./IntegrationModals";
import {getAreaLayers, getColorLayers, getOptionChart,} from "../../utils/mapUtils";
import ReportArea from "./ReportArea";
import IconButton from "@mui/material/IconButton";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';


const Map = memo(({year, setAllArea}) => {
    const [layer, setLayer] = useState(null);
    const [layerSearch, setLayerSearch] = useState(null);
    const [statistics, setStatistics] = useState([]);
    const [activeArea, setActiveArea] = useState(null);
    const [deleteIdArea, setDeleteIdArea] = useState(null);
    const [colorLayers, setColorLayers] = useState([]);
    const [load, setLoad] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const [value, setValue] = React.useState("1");
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [searchValue, setSearchValue] = useState(false);
    const [grouping, setGrouping] = useState("crop");
    const [openBackdrop, setOpenBackdrop] = React.useState(false);
    const [hideMenu, setHideMenu] = React.useState(false);
    const [openSpeedDial, setOpenSpeedDial] = React.useState(false);
    const [openTelemetryModal, setOpenTelemetryModal] = React.useState(false);
    const [openSatelliteModal, setOpenSatelliteModal] = React.useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const actions = [
        { icon: <WallpaperIcon />, name: 'Космоснимки' },
        { icon: <ModeOfTravelIcon />, name: 'Телеметрия' },
    ];

    const handleCloseBackdrop = () => {
        setTimeout(() => {
            setOpenBackdrop(false);
        }, 1000);
    };

    const handleOpenBackdrop = () => {
        setOpenBackdrop(true);
    };

    useEffect(() => {
        if (!load) {
            getData();
        }
    }, [year, grouping]);

    useEffect(() => {
        if (searchValue && layer) {
            setLayerSearch(
                layer.features.filter((item) =>
                    item.properties.crop.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        } else if (layer) {
            setLayerSearch(layer.features);
        }
    }, [searchValue, layer]);

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

    const handleSpeedDialAction = (action) => {

        if (action.name === 'Космоснимки') {
            // Открываем модальное окно космоснимков
            setOpenSatelliteModal(true);
        } else if (action.name === 'Телеметрия') {
            // Открываем модальное окно телеметрии
            setOpenTelemetryModal(true);
        }
    };

    const handleCloseTelemetryModal = () => {
        setOpenTelemetryModal(false);
    };

    const handleCloseSatelliteModal = () => {
        setOpenSatelliteModal(false);
    };

    // Функция для преобразования новой структуры данных в формат GeoJSON
    const transformNewDataToGeoJSON = (data, grouping) => {
        const features = [];
        
        // Проходим по всем группам
        data.groups?.forEach(group => {
            // Проходим по всем культурам в группе
            group.crops?.forEach(crop => {
                // Проходим по всем полям в культуре
                crop.fields?.forEach(field => {
                    if (field.geojson) {
                        // Добавляем свойства в зависимости от группировки
                        const properties = {
                            id: field.field_id,
                            name: field.field_name,
                            area: field.area,
                            color: crop.color,
                            center: field.center
                        };
                        
                        // Добавляем свойства для группировки
                        if (grouping === 'crop') {
                            properties[grouping] = field.crop_name;
                            properties.crop = field.crop_name;
                            properties.crop_name = field.crop_name;
                            properties.cultivar = field.cultivar;
                            properties.crop_kind = field.cultivar;
                            properties.crop_group = group.group_name;
                        } else if (grouping === 'crop_group') {
                            properties[grouping] = group.group_name;
                            properties.crop_group = group.group_name;
                            properties.crop = field.crop_name;
                            properties.crop_name = field.crop_name;
                            properties.cultivar = field.cultivar;
                            properties.crop_kind = field.cultivar;
                        } else if (grouping === 'productivity') {
                            properties[grouping] = group.group_name;
                            properties.crop = field.crop_name;
                            properties.crop_name = field.crop_name;
                            properties.cultivar = field.cultivar;
                            properties.crop_kind = field.cultivar;
                            properties.crop_group = group.group_name;
                            // Добавляем урожайность, если она есть
                            if (field.productivity_value !== undefined) {
                                properties.productivity_value = field.productivity_value;
                            }
                        }
                        
                        // Создаем GeoJSON feature
                        features.push({
                            type: 'Feature',
                            geometry: field.geojson.geometry,
                            properties: properties
                        });
                    }
                });
            });
        });
        
        return {
            type: 'FeatureCollection',
            center: data.center,
            total_area: data.total_area,
            features: features
        };
    };

    const getData = () => {
        handleOpenBackdrop();
        setLoad(true);
        httpService
            .get(`/fields_v2?year=${year}&group=${grouping}`)
            .then((res) => {
                if (res?.status === 200 && res.data) {
                    // Преобразуем новую структуру данных в формат GeoJSON
                    const transformedData = transformNewDataToGeoJSON(res.data, grouping);
                    
                    setLayer(transformedData);
                    setAllArea(transformedData.total_area.toFixed(2));
                    getAreaLayers(transformedData, setStatistics, grouping);
                    getColorLayers(transformedData, setColorLayers, grouping);
                } else {
                    resetState();
                }
            })
            .finally(() => {
                setLoad(false);
                handleCloseBackdrop();
            });
    };

    const resetState = () => {
        setLayer([]);
        setStatistics([]);
        setActiveArea(null);
        setColorLayers([]);
    };

    const deletArea = () => {
        if (deleteIdArea) {
            const seasonIds = Array.isArray(deleteIdArea) ? deleteIdArea : [deleteIdArea];
            httpService
                .delete(`/fields_v2`, {
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    data: {
                        year: year,
                        season_ids: seasonIds
                    }
                })
                .then((res) => {
                    if (res.status === 200) {
                        getData();
                        enqueueSnackbar("Поле успешно удалено", {
                            autoHideDuration: 4000,
                            variant: "success",
                        });
                    } else {
                        enqueueSnackbar("Ошибка удаления поля", {
                            autoHideDuration: 4000,
                            variant: "error",
                        });
                    }
                })
                .catch(() => {
                    enqueueSnackbar("Ошибка удаления поля", {
                        autoHideDuration: 4000,
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
                        top: 0,
                        left: 0,
                        zIndex: 1000,
                        width: "100%",
                        maxWidth: hideMenu ? "0px" : isSmallScreen ? "300px" : "400px",
                        padding: hideMenu ? 0 : "10px",
                        height: "100%",
                        bgcolor: "background.paper",
                        display: "flex",
                        flexDirection: "column",
                        position: "absolute",
                        transition: "all 0.3s ease",
                    }}
                >
                    <IconButton
                        sx={{
                            position: "absolute",
                            right: "-45px",
                            top: '50%',
                            transform: `translate(0, -50%) rotate(${hideMenu ? "180deg" : 0})`,
                            transition: "all 0.3s ease",
                            zIndex: 1000,
                        }}
                        onClick={() => {
                            setHideMenu(!hideMenu);
                        }}
                    >
                        <ArrowCircleLeftIcon sx={{ fontSize: 40 }}/>
                    </IconButton>
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
                                <Tab label="Поля" value="1"/>
                                <Tab label="Структура" value="2"/>
                                <Tab label="Отчет" value="3"/>
                            </TabList>
                            {/* </Box> */}
                            <TabPanel
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    maxHeight: "96%",
                                }}
                                value="1"
                            >
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                        Группировка
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={grouping}
                                        label="Группировка"
                                        onChange={handleChangeGrouping}
                                        size="small"
                                    >
                                        <MenuItem value={"crop"}>По культуре</MenuItem>
                                        <MenuItem value={"crop_group"}>По группе</MenuItem>
                                        <MenuItem value={"productivity"}>По урожайности</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    size="small"
                                    sx={{marginTop: "20px"}}
                                    onChange={(e) => {
                                        setSearchValue(e.target.value);
                                    }}
                                    fullWidth
                                    id="outlined-basic"
                                    label="Поиск"
                                    variant="outlined"
                                />
                                <Box
                                    display={"flex"}
                                    flexDirection={"column"}
                                    overflow={"hidden"}
                                    sx={{overflowY: "scroll"}}
                                >
                                    {layerSearch?.length && layerSearch ? (
                                        <ListArea
                                            layer={layerSearch}
                                            setActiveArea={setActiveArea}
                                            setDeleteIdArea={setDeleteIdArea}
                                            handleOpenConfirmDelete={handleOpenConfirmDelete}
                                            grouping={grouping}
                                        />
                                    ) : (
                                        <p>Нет данных</p>
                                    )}
                                </Box>
                            </TabPanel>
                            <TabPanel sx={{marginTop: "-40px"}} value="2">
                                <Box>
                                    {statistics.length ? (
                                        <Chart
                                            chartType="PieChart"
                                            width="100%"
                                            height="350px"
                                            data={statistics}
                                            options={getOptionChart(colorLayers)}
                                            // style={{ display: "flex", justifyContent: "space-between" }}
                                        />
                                    ) : null}
                                </Box>
                            </TabPanel>
                            <TabPanel
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "90%",
                                    paddingBottom: "0px",
                                    marginTop: "-40px",
                                }}
                                value="3"
                            >
                                <ReportArea grouping={grouping} year={year}/>
                            </TabPanel>
                        </TabContext>
                    </Box>
                </Box>
                <MapContainer
                    center={[56.66163543086128, 54.6566711425781]}
                    zoom={12}
                    zoomControl={false}
                    scrollWheelZoom={true}
                    style={{height: "100%", width: "100%", position: "relative"}}
                >
                    <ZoomControl
                        position={"topright"}
                        className="custom-zoom-control"
                    />
                    {layer ? (
                        <Layers
                            year={year}
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
                            right: "0px",
                            bottom: "0px",
                            width: "200px",
                            height: isSmallScreen ? "auto" : "100%",
                            maxHeight: isSmallScreen ? "500px" : "100%",
                            minHeight: "100px",
                            zIndex: "1000",
                            background: "#ffffffed",
                            borderRadius: "0px",
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
                                gap: "10px",
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
                                                alignItems={"center"}
                                                alignContent={"center"}
                                                display={"flex"}
                                                gap={"4px"}
                                            >
                                                <Box
                                                    sx={{
                                                        width: "5px",
                                                        height: "30px",
                                                        background: color,
                                                        minWidth: "5px",
                                                        minHeight: '100%',
                                                        borderRadius: "2px",
                                                        opacity: 0.8,
                                                    }}
                                                ></Box>
                                                <Typography align="left" variant="caption">
                                                    {item[0]}
                                                </Typography>
                                                <Typography sx={{marginLeft: 'auto'}} variant="caption">
                                                    {item[1]}га
                                                </Typography>
                                            </Box>
                                        );
                                    }
                                })}
                        </Box>
                    </Box>
                ) : null}
                
                {/* SpeedDial в нижнем правом углу */}
                <SpeedDial
                    ariaLabel="Дополнительные функции"
                    sx={{ 
                        position: 'absolute', 
                        bottom: 16, 
                        right: 220,
                        zIndex: 1000
                    }}
                    icon={<SpeedDialIcon />}
                    onClose={() => setOpenSpeedDial(false)}
                    onOpen={() => setOpenSpeedDial(true)}
                    open={openSpeedDial}
                >
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            tooltipOpen={true}
                            onClick={() => handleSpeedDialAction(action)}
                            // sx={{
                            //     '& .MuiSpeedDialAction-staticTooltipLabel': {
                            //         backgroundColor: '#616161 !important',
                            //         color: 'white !important',
                            //         fontSize: '14px !important',
                            //         fontWeight: '500 !important',
                            //         borderRadius: '6px !important',
                            //         padding: '8px 12px !important',
                            //         boxShadow: '0 2px 8px rgba(0,0,0,0.3) !important',
                            //         minWidth: '120px !important',
                            //         width: '120px !important',
                            //         textAlign: 'center !important',
                            //         transition: 'background-color 0.3s ease !important',
                            //     },
                            //     '&:hover .MuiSpeedDialAction-staticTooltipLabel': {
                            //         backgroundColor: '#4caf50 !important',
                            //     }
                            // }}
                            // TooltipProps={{
                            //     placement: 'left',
                            //     arrow: true,
                            // }}
                        />
                    ))}
                </SpeedDial>
            </div>
            <ConfirmDeleteModal
                deletArea={deletArea}
                handleCloseConfirmDelete={handleCloseConfirmDelete}
                openConfirmDelete={openConfirmDelete}
                deleteIdArea={deleteIdArea}
            />
            <Backdrop
                sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackdrop}
                onClick={handleCloseBackdrop}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>

            {/* Модальные окна */}
            <TelemetryModal 
                open={openTelemetryModal} 
                onClose={handleCloseTelemetryModal} 
            />
            <SatelliteModal 
                open={openSatelliteModal} 
                onClose={handleCloseSatelliteModal} 
            />
        </>
    );
});

export default Map;
