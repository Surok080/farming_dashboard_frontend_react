import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    TextField,
} from '@mui/material';
import {
    TabContext,
    TabList,
    TabPanel,
} from '@mui/lab';
import {Chart} from 'react-google-charts';
import IconButton from '@mui/material/IconButton';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ListArea from './ListArea';
import ReportArea from './ReportArea';
import {getOptionChart} from '../../utils/mapUtils';
import {defaultTheme} from "../dashboard/Dashboard";

const MapSidebar = ({
                        hideMenu,
                        setHideMenu,
                        isSmallScreen,
                        grouping,
                        onGroupingChange,
                        searchValue,
                        onSearchChange,
                        layerSearch,
                        onFieldClick,
                        setActiveArea,
                        setDeleteIdArea,
                        handleOpenConfirmDelete,
                        setHoveredFieldId,
                        statistics,
                        colorLayers,
                        year,
                        tabValue,
                        onTabChange,
                    }) => {
    return (
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
                onClick={() => setHideMenu(!hideMenu)}
            >
                <ArrowCircleLeftIcon sx={{fontSize: 40}}/>
            </IconButton>

            <Box
                sx={{
                    width: "100%",
                    typography: "body1",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                <TabContext value={tabValue}>
                    <TabList
                        centered
                        textColor="primary"
                        onChange={onTabChange}
                        aria-label="lab API tabs example"
                    >
                        <Tab label="Поля" value="1"/>
                        <Tab label="Структура" value="2"/>
                        <Tab label="Отчет" value="3"/>
                    </TabList>

                    <TabPanel
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "96%",
                            [defaultTheme.breakpoints.down("lg")]: {
                                padding: "10px 5px"
                            },

                        }}
                        value="1"
                    >
                        <FormControl fullWidth>
                            <InputLabel id="grouping-select-label">Группировка</InputLabel>
                            <Select
                                labelId="grouping-select-label"
                                id="grouping-select"
                                value={grouping}
                                label="Группировка"
                                onChange={onGroupingChange}
                                size="small"
                            >
                                <MenuItem value="crop">По культуре</MenuItem>
                                <MenuItem value="crop_group">По группе</MenuItem>
                                <MenuItem value="productivity">По урожайности</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            size="small"
                            sx={{marginTop: "20px"}}
                            onChange={(e) => onSearchChange(e.target.value)}
                            fullWidth
                            id="search-field"
                            label="Поиск"
                            variant="outlined"
                        />

                        <Box
                            display="flex"
                            flexDirection="column"
                            overflow="hidden"
                            sx={{overflowY: "scroll"}}
                        >
                            {layerSearch?.length ? (
                                <ListArea
                                    layer={layerSearch}
                                    setActiveArea={setActiveArea}
                                    setDeleteIdArea={setDeleteIdArea}
                                    handleOpenConfirmDelete={handleOpenConfirmDelete}
                                    grouping={grouping}
                                    onFieldClick={onFieldClick}
                                    setHoveredFieldId={setHoveredFieldId}
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
    );
};

export default MapSidebar;

