import {Box, Checkbox, Collapse, Divider, IconButton, List, ListItemButton, Typography,} from "@mui/material";
import React, {useMemo, useState} from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import {defaultTheme} from "../dashboard/Dashboard";

const ListArea = ({
                      layer,
                      setActiveArea,
                      setDeleteIdArea,
                      handleOpenConfirmDelete,
                      state = false,
                      grouping = "crop",
                      onFieldClick,
                      setHoveredFieldId,
                  }) => {
    // State to track selected items
    const [selectedItems, setSelectedItems] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});

    // Группировка данных
    const groupedData = useMemo(() => {
        // Если группировка по культуре или урожайности - не группируем, показываем все поля в одном списке
        if (grouping === 'crop' || grouping === 'productivity') {
            return {
                'all': {
                    groupName: 'Все поля',
                    items: layer
                }
            };
        }
        
        // Если группировка по группе - группируем по группам культур
        if (grouping === 'crop_group') {
            const groups = {};
            
            layer.forEach((item) => {
                const cropGroup = item.properties.crop_group || 'Другие';
                const groupKey = cropGroup;
                const groupName = cropGroup;

                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        groupName: groupName,
                        items: []
                    };
                }

                groups[groupKey].items.push(item);
            });

            return groups;
        }

        // По умолчанию - без группировки
        return {
            'all': {
                groupName: 'Все поля',
                items: layer
            }
        };
    }, [layer, grouping]);

    // Инициализируем состояние групп при изменении данных или группировки
    React.useEffect(() => {
        if (Object.keys(groupedData).length > 0) {
            // При группировке по группе - все группы свернуты, иначе - развернуты
            const defaultExpanded = grouping !== 'crop_group';
            const updated = {};
            Object.keys(groupedData).forEach(key => {
                updated[key] = defaultExpanded;
            });
            setExpandedGroups(updated);
        }
    }, [groupedData, grouping]);

    // Toggle expanded state
    const handleExpandToggle = (groupKey) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: prev[groupKey] === undefined ? false : !prev[groupKey]
        }));
    };

    // Handle individual checkbox toggle
    const handleToggle = (value) => {
        const currentIndex = selectedItems.indexOf(value);
        const newChecked = [...selectedItems];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedItems(newChecked);
    };

    // Handle select all checkboxes
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(layer.map((item) => item.properties.id));
        } else {
            setSelectedItems([]);
        }
    };

    // Check if all items are selected
    const isAllSelected = layer.length === selectedItems.length;

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 0,
                }}
            >
                <Box display={"flex"} gap={4} alignItems={"center"}>
                    <Checkbox
                        sx={{padding: 0, marginLeft: "-2px"}}
                        edge="end"
                        onChange={handleSelectAll}
                        checked={isAllSelected}
                        inputProps={{"aria-label": "select all areas"}}
                    />
                    <Typography variant="body">Выбрать все</Typography>
                </Box>
                <IconButton
                    disabled={selectedItems?.length === 0}
                    onClick={(e) => {
                        e.stopPropagation();
                        // e.preventDefault()
                        setDeleteIdArea(selectedItems);
                        handleOpenConfirmDelete();
                    }}
                >
                    <DeleteForeverIcon/>
                </IconButton>
            </Box>
            <Divider/>
            <List
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    bgcolor: "background.paper",
                }}
            >
                {Object.keys(groupedData).map((groupKey) => {
                    const group = groupedData[groupKey];
                    const isExpanded = expandedGroups[groupKey] !== false;
                    // Скрываем заголовок группы, если группировка по культуре или урожайности
                    const showGroupHeader = grouping === 'crop_group';

                    return (
                        <Box key={groupKey}>
                            {/* Заголовок группы - показываем только при группировке по группе */}
                            {showGroupHeader && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "3px 16px",
                                        backgroundColor: "#f5f5f5d4",
                                        border: "1px solid #e0e0e0cf",
                                        borderRadius: "4px",
                                        [defaultTheme.breakpoints.down("lg")]: {
                                            padding: "5px 10px 5px 1px"
                                        },

                                    }}
                                    onClick={() => handleExpandToggle(groupKey)}
                                >
                                    <Box display="flex" alignItems="center" gap={1} maxWidth={"70%"} width={"100%"}>
                                        <IconButton size="small">
                                            {isExpanded ? <ExpandLess/> : <ExpandMore/>}
                                        </IconButton>
                                        <Typography variant="body2" textAlign={"left"}
                                                    sx={{fontWeight: "bold", fontSize: "13px"}}>
                                            {group.groupName}
                                        </Typography>
                                        <Typography marginLeft={"auto"} variant="caption" sx={{color: "text.secondary"}}>
                                            ({group.items.length})
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{color: "text.secondary"}}>
                                        {group.items.reduce((sum, item) => sum + parseFloat(item.properties.area || 0), 0).toFixed(2)} га
                                    </Typography>
                                </Box>
                            )}

                            {/* Поля в группе */}
                            <Collapse in={showGroupHeader ? isExpanded : true} timeout="auto" unmountOnExit>
                                <Box display="flex" flexDirection="column" gap={1}
                                     sx={{paddingBottom: "8px", paddingTop: "15px"}}>
                                    {group.items.map((item, index) => {
                                        const labelId = `checkbox-list-label-${item.properties.id}`;

                                        return (
                                            <Box display={"flex"} key={index}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedItems.indexOf(item.properties.id) !== -1}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{"aria-labelledby": labelId}}
                                                    onChange={() => handleToggle(item.properties.id)}
                                                />
                                                <ListItemButton
                                                    key={index}
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        gap: "7px",
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
                                                    onMouseEnter={() => {
                                                        if (setHoveredFieldId) {
                                                            setHoveredFieldId(item.properties.id);
                                                        }
                                                    }}
                                                    onMouseLeave={() => {
                                                        if (setHoveredFieldId) {
                                                            setHoveredFieldId(null);
                                                        }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // При клике на поле в списке - только перемещаем карту к полю
                                                        setActiveArea(item);
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: "8px",
                                                            height: "100%",
                                                            borderRadius: "3px",
                                                            backgroundColor: item.properties.color,
                                                            opacity: 0.7,
                                                        }}
                                                    />

                                                    <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{fontWeight: "bold", fontSize: "12px"}}
                                                        >
                                                            {state
                                                                ? item.properties.plot_cadastral_number
                                                                : item.properties.crop}
                                                        </Typography>
                                                        <Typography noWrap maxWidth={140} variant="caption">
                                                            {state
                                                                ? item.properties.plot_form_owner
                                                                : item.properties.crop_kind}
                                                            (
                                                            {state
                                                                ? item.properties.plot_land_category
                                                                : item.properties.name}
                                                            )
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="caption">
                                                        {item.properties.area} га
                                                    </Typography>
                                                    <IconButton
                                                        disabled={selectedItems.indexOf(item.properties.id) !== -1}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteIdArea(item.properties.id);
                                                            handleOpenConfirmDelete();
                                                        }}
                                                    >
                                                        <DeleteForeverIcon/>
                                                    </IconButton>
                                                </ListItemButton>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Collapse>
                        </Box>
                    );
                })}
            </List>
        </>
    );
};

export default ListArea;
