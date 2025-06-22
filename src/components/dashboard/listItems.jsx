import * as React from "react";
import {useContext, useEffect, useState} from "react";
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
import {useSelector} from "react-redux";
import {appBarName, moveStringToSecondPositionImmutable} from "../../utils/appBar";
import {defaultTheme} from "./Dashboard";
import Typography from "@mui/material/Typography";

export default function ListItems() {
    const {valueTabs, setValueTabs} = useContext(Context);
    const user = useSelector((state) => state.user)
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        if (user.userInfo.tabs && user.userInfo.tabs.length > 0) {
            const tabNames = user.userInfo.tabs.map(tab => tab.name);
            setMenu(moveStringToSecondPositionImmutable(tabNames, 'tech_map'))
        }
    }, [user]);

    const setTabs = (value) => {
        localStorage.setItem('tabs', value);
        setValueTabs(value)
    }

    const getIconAppBar = (menu) => {
        switch (menu) {
            case 'cartogram':
                return <GridOnIcon
                    sx={{color: valueTabs === "cartogram" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'fields':
                return <LayersOutlinedIcon
                    sx={{color: valueTabs === "fields" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'state_monitoring':
                return <DashboardOutlinedIcon
                    sx={{color: valueTabs === "state_monitoring" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'tech_map':
                return <DescriptionOutlinedIcon
                    sx={{color: valueTabs === "tech_map" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            default:
                return null;
        }
    }

    return (
        <>
            <ListItemButton sx={{
                [defaultTheme.breakpoints.down("lg")]: {
                    flexDirection: 'column',
                    justifyContent: 'center',
                },
            }} onClick={() => setTabs("dashboard")}>
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
                menu.map((item, index) => {
                    return (
                        <ListItemButton sx={{
                            [defaultTheme.breakpoints.down("lg")]: {
                                flexDirection: 'column',
                                justifyContent: 'center',
                            },
                        }} key={item} onClick={() => setTabs(item)}>
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
            <ListItemButton sx={{
                [defaultTheme.breakpoints.down("lg")]: {
                    flexDirection: 'column',
                    justifyContent: 'center',
                },
            }} onClick={() => setTabs("menu_settings")}>
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
}
