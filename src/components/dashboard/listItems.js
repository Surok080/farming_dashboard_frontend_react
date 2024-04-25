import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Context } from "../../store/context";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import GridOnIcon from '@mui/icons-material/GridOn';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

export default function ListItems() {
  const { valueTabs, setValueTabs } = React.useContext(Context);

  return (
    <>
      <ListItemButton onClick={() => setValueTabs("menu_dashboard")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <GridViewOutlinedIcon sx={{color: valueTabs ===  "menu_dashboard" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="Обзор" />
      </ListItemButton>

      <ListItemButton onClick={() => setValueTabs("menu_tehcart")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <DescriptionOutlinedIcon sx={{color: valueTabs ===  "menu_tehcart" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="ТехКарта" />
      </ListItemButton>

      <ListItemButton onClick={() => setValueTabs("menu_fields")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <LayersOutlinedIcon sx={{color: valueTabs ===  "menu_fields" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="Поля" />
      </ListItemButton>

      <ListItemButton onClick={() => setValueTabs("menu_сartograms")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <GridOnIcon sx={{color: valueTabs ===  "menu_сartograms" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="Картограммы" />
      </ListItemButton>

      <ListItemButton onClick={() => setValueTabs("menu_gos")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <DashboardOutlinedIcon sx={{color: valueTabs ===  "menu_gos" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="Госмониторинг" />
      </ListItemButton>

      {/* <ListItemButton>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Пользователи" />
      </ListItemButton> */}

      <ListItemButton onClick={() => setValueTabs("menu_settings")}>
        <ListItemIcon sx={{minWidth: '36px'}}>
          <SettingsOutlinedIcon sx={{color: valueTabs ===  "menu_settings" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
        </ListItemIcon>
        <ListItemText primary="Настройки" />
      </ListItemButton>
    </>
  );
}
