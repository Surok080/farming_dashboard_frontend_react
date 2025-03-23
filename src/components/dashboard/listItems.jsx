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
import {appBarName} from "../../utils/appBar";

export default function ListItems() {
  const { valueTabs, setValueTabs } = useContext(Context);
    const user = useSelector((state) => state.user)
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        if (user.userInfo.module && user.userInfo.module.length > 0) {
            setMenu(user.userInfo.module)
        }
    }, [user]);

    const setTabs = (value) => {
      localStorage.setItem('tabs', value);
      setValueTabs(value)
  }

    const getIconAppBar = (menu) => {
        switch (menu) {
            case 'cartogram':
                return <GridOnIcon sx={{color: valueTabs ===  "cartogram" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'fields':
                return <LayersOutlinedIcon sx={{color: valueTabs ===  "fields" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'state_monitoring':
                return <DashboardOutlinedIcon sx={{color: valueTabs ===  "state_monitoring" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            case 'tech_map':
                return <DescriptionOutlinedIcon sx={{color: valueTabs ===  "tech_map" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
            default:
                return null;
        }
    }

  return (
    <>
      <ListItemButton onClick={() => setTabs("dashboard")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <GridViewOutlinedIcon sx={{color: valueTabs ===  "dashboard" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="Обзор" />
      </ListItemButton>
        {
            menu.map((item, index) => {
                if (item === 'api_smsr' || item === 'proxy_1c') return (null);
                return (
                    <ListItemButton key={item} onClick={() => setTabs(item)}>
                        <ListItemIcon sx={{minWidth: '36px'}}>
                            {getIconAppBar(item)}
                        </ListItemIcon>
                        <ListItemText primary={appBarName(item)} />
                    </ListItemButton>
                )
            })
        }
      <ListItemButton onClick={() => setTabs("menu_settings")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <SettingsOutlinedIcon sx={{color: valueTabs ===  "menu_settings" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="Настройки" />
      </ListItemButton>
    </>
  );
}
