import React, {useEffect, useState} from 'react';
import {httpService} from '../../api/setup';
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
import IconButton from '@mui/material/IconButton';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ListArea from './ListArea';
import StructureContent from './StructureContent';
import StructureTable from './StructureTable';
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
                        hideStructure = false,
                        wrapNameInParens = true,
                    }) => {
    const isStructureTab = !hideStructure && tabValue === "2";
    const sidebarWidth = hideMenu 
        ? "0px" 
        : isStructureTab 
            ? "100%" 
            : isSmallScreen 
                ? "300px" 
            : "400px";
    
    // Загрузка данных для вкладки "Структура" (только если вкладка доступна)
    const [structureReportData, setStructureReportData] = useState(null);
    
    useEffect(() => {
        if (!hideStructure && tabValue === "2" && year) {
            httpService.get(`/fields_v2/report?year=${year}`)
                .then((res) => {
                    if (res.status && res.status === 200) {
                        setStructureReportData(res.data);
                    } else {
                        setStructureReportData(null);
                    }
                })
                .catch((e) => {
                    setStructureReportData(null);
                });
        }
    }, [hideStructure, tabValue, year]);

    const fieldsPanelContent = (
        <>
            <FormControl  sx={{marginTop: "20px"}} fullWidth>
                <InputLabel id="grouping-select-label">Группировка</InputLabel>
                <Select
                    labelId="grouping-select-label"
                    id="grouping-select"
                    value={grouping}
                    label="Группировка"
                    onChange={onGroupingChange}
                    size="small"
                >
                    <MenuItem value="all">Без группировки</MenuItem>
                    <MenuItem value="crop">По культуре</MenuItem>
                    <MenuItem value="crop_group">По группе</MenuItem>
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
                        wrapNameInParens={wrapNameInParens}
                    />
                ) : (
                    <p>Нет данных</p>
                )}
            </Box>
        </>
    );

    return (
        <Box
            sx={{
                top: 0,
                left: 0,
                zIndex: 1000,
                width: "100%",
                maxWidth: sidebarWidth,
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
                    overflow: hideStructure ? "hidden" : (tabValue === "2" ? "visible" : "hidden"),
                }}
            >
                {hideStructure ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "96%",
                            height: "100%",
                            [defaultTheme.breakpoints.down("lg")]: {
                                padding: "10px 5px"
                            },
                        }}
                    >
                        {fieldsPanelContent}
                    </Box>
                ) : (
                    <TabContext value={tabValue}>
                        <TabList
                            textColor="primary"
                            onChange={onTabChange}
                            aria-label="lab API tabs example"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    height: '2px',
                                },
                                '& .MuiTab-root': {
                                    minWidth: 'auto',
                                    padding: '12px 24px',
                                    flex: '0 1 auto',
                                },
                                '& .MuiTabs-flexContainer': {
                                    justifyContent: 'flex-start',
                                },
                            }}
                        >
                            <Tab label="Поля" value="1"/>
                            <Tab label="Структура" value="2"/>
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
                            {fieldsPanelContent}
                        </TabPanel>

                        <TabPanel 
                            sx={{
                                marginTop: "-40px",
                                padding: "0",
                                height: "100%",
                                display: "flex",
                                gap: "10px",
                                overflow: "visible",
                                position: "relative",
                            }} 
                            value="2"
                        >
                            {/* Левый блок - 60% */}
                            <Box
                                sx={{
                                    width: "60%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "auto",
                                    paddingBottom: "150px",
                                }}
                            >
                                <StructureContent key={`structure-${tabValue}-${year}`} year={year} reportData={structureReportData} />
                            </Box>

                            {/* Правый блок - 40% */}
                            <Box
                                sx={{
                                    width: "40%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "auto",
                                }}
                            >
                                <StructureTable reportData={structureReportData} />
                            </Box>
                        </TabPanel>
                    </TabContext>
                )}
            </Box>
        </Box>
    );
};

export default MapSidebar;

