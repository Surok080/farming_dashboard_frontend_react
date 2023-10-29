import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import LayersIcon from "@mui/icons-material/Layers";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Context } from "../../store/context";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

export default function ListItems() {
  const { valueTabs, setValueTabs } = React.useContext(Context);

  return (
    <>
      <ListItemButton onClick={() => setValueTabs("menu_dashboard")}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Дашборд" />
      </ListItemButton>

      <ListItemButton onClick={() => setValueTabs("menu_fields")}>
        <ListItemIcon>
          <AgricultureIcon />
        </ListItemIcon>
        <ListItemText primary="Поля" />
      </ListItemButton>

      <ListItemButton>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Госмониторинг" />
      </ListItemButton>

      <ListItemButton>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Пользователи" />
      </ListItemButton>

      <ListItemButton>
        <ListItemIcon>
          <SettingsApplicationsIcon />
        </ListItemIcon>
        <ListItemText primary="Настройки сайта" />
      </ListItemButton>
    </>
  );
}
