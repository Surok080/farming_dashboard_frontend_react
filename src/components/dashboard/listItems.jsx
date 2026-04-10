import * as React from "react";
import {memo, useCallback, useContext, useEffect, useState} from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {Context} from "../../store/context";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import GridOnIcon from '@mui/icons-material/GridOn';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import {useSelector} from "react-redux";
import {appBarName, sortTabsByFixedOrder} from "../../utils/appBar";
import {defaultTheme} from "./Dashboard";
import Typography from "@mui/material/Typography";

const ListItems = memo(() => {
    const {valueTabs, setValueTabs} = useContext(Context);
    const user = useSelector((state) => state.user)
    const [menu, setMenu] = useState([]);
    const menuItemSx = {
        '&:hover': {
            backgroundColor: 'rgba(130, 248, 101, 0.14)',
        },
        [defaultTheme.breakpoints.down("lg")]: {
            flexDirection: 'column',
            justifyContent: 'center',
        },
    };

    useEffect(() => {
        if (user.userInfo.tabs && user.userInfo.tabs.length > 0) {
            let tabNames = user.userInfo.tabs.map(tab => tab.name);
            
            // Сортируем вкладки по фиксированному порядку:
            // 1. tech_map (ТехКарта)
            // 2. fields/fields_v2 (Поля)
            // 3. monitoring (Мониторинг)
            // 4. cartogram (Картограммы)
            // 5. state_monitoring (Госмониторинг)
            tabNames = sortTabsByFixedOrder(tabNames);
            
            setMenu(tabNames);
        }
    }, [user]);

    const setTabs = useCallback((value) => {
        localStorage.setItem('tabs', value);
        setValueTabs(value)
    }, [setValueTabs]);

    const getIconAppBar = useCallback((menu) => {
        switch (menu) {
            case 'cartogram':
                return <GridOnIcon
                    sx={{color: valueTabs === "cartogram" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'fields':
            case 'fields_v2':
                return <LayersOutlinedIcon
                    sx={{color: (valueTabs === "fields" || valueTabs === "fields_v2") ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'state_monitoring':
                return <DashboardOutlinedIcon
                    sx={{color: valueTabs === "state_monitoring" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'monitoring':
                return <NavigationOutlinedIcon
                    sx={{color: valueTabs === "monitoring" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'tech_map':
                return <DescriptionOutlinedIcon
                    sx={{color: valueTabs === "tech_map" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            default:
                return null;
        }
    }, [valueTabs]);

    return (
        <>
            <ListItemButton sx={menuItemSx} onClick={() => setTabs("dashboard")}>
                <ListItemIcon sx={{
                    minWidth: '36px',
                    [defaultTheme.breakpoints.down("lg")]: {
                        justifyContent: 'center',
                    },
                }}>
                    <GridViewOutlinedIcon
                        sx={{color: valueTabs === "dashboard" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography sx={{
                            [defaultTheme.breakpoints.down("lg")]: {
                                fontSize: '14px'
                            }
                        }}>
                            Обзор
                        </Typography>
                    }
                />
            </ListItemButton>
            {
                menu.map((item) => {
                    return (
                        <ListItemButton sx={menuItemSx} key={item} onClick={() => setTabs(item)}>
                            <ListItemIcon sx={{
                                minWidth: '36px',
                                [defaultTheme.breakpoints.down("lg")]: {
                                    justifyContent: 'center',
                                },
                            }}>
                                {getIconAppBar(item)}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography sx={{
                                        [defaultTheme.breakpoints.down("lg")]: {
                                            fontSize: '14px'
                                        }
                                    }}>
                                        {appBarName(item)}
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    )
                })
            }
            <ListItemButton sx={menuItemSx} onClick={() => setTabs("menu_settings")}>
                <ListItemIcon sx={{
                    minWidth: '36px',
                    [defaultTheme.breakpoints.down("lg")]: {
                        justifyContent: 'center',
                    },
                }}>
                    <SettingsOutlinedIcon sx={{
                        color: valueTabs === "menu_settings" ? "#82F865" : "",
                        transition: 'all .2s ease-in-out'
                    }}/>
                </ListItemIcon>
                <ListItemText   primary={
                    <Typography sx={{
                        [defaultTheme.breakpoints.down("lg")]: {
                            fontSize: '14px'
                        }
                    }}>
                        Настройки
                    </Typography>
                }/>
            </ListItemButton>
        </>
    );
});

ListItems.displayName = 'ListItems';

export default ListItems;
