import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { memo } from "react";
import MuiAppBar from "@mui/material/AppBar";
import styled from "@emotion/styled";
import { drawerWidth } from "./dashboard/Dashboard";


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(true && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const AppBarHeader = memo(({ valueTabs, year, user, setYear}) => {

  const handleChangeYear = (e) => {
    setYear(e.target.value);
  };

  function getNameTabs() {
    switch (valueTabs) {
      case "menu_dashboard":
        return "Обзор";
        break;
      case "menu_fields":
        return "Поля";
        break;
      case "menu_gos":
        return "Госмониторинг";
        break;
      case "menu_settings":
        return "Настройки";
        break;

      default:
        break;
    }
  }

  return (
    <>
      <AppBar
        position="absolute"
        sx={{
          boxShadow: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          background: "#f0f0f0",
        }}
      >
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, boxShadow: "none" }}
            textAlign={"left"}
          >
            {getNameTabs()}
          </Typography>
          <Box sx={{ minWidth: 120, marginRight: "20px" }}>
            <FormControl fullWidth>
              <InputLabel id="select-label">Год</InputLabel>
              <Select
                size="small"
                labelId="select-label"
                id="simple-select"
                value={year}
                label="year"
                onChange={handleChangeYear}
              >
                <MenuItem value={2024}>2024</MenuItem>
                <MenuItem value={2023}>2023</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {user ?? ""}
        </Toolbar>
      </AppBar>
    </>
  );
});

export default AppBarHeader;
