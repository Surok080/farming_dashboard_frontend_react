import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import ListItems from "./dashboard/listItems";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { useNavigate } from "react-router-dom";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MuiDrawer from "@mui/material/Drawer";
import styled from "@emotion/styled";
import { drawerWidth } from "./dashboard/Dashboard";

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const LeftMenu = () => {
  const navigate = useNavigate();

  return (
    <>
      <Drawer
        sx={{
          position: "absolute",
          height: "100%",
          "& .MuiPaper-root": {
            width: 180,
          },
        }}
        variant="permanent"
        PaperProps={{
          sx: {
            width: "180",
          },
        }}
        open={true}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            paddingBottom: "50px",
            background: "#F0F0F0",
            overflow: "hidden",
          }}
        >
          <Box>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            ></Toolbar>
            <Divider />
            <List sx={{ paddingTop: "10px" }} component="nav">
              <Box height={"50px"}>
                <Typography
                  component="h2"
                  variant="h6"
                  color="inherit"
                  noWrap
                  sx={{ flexGrow: 1 }}
                  textAlign={"center"}
                >
                  ЗАО «БИРЮЛИ»
                </Typography>
              </Box>

              <ListItems />
              <Divider sx={{ my: 1 }} />
            </List>
          </Box>
          <Box>
            <ListItemButton onClick={() => console.log("Вопрос")}>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <HelpOutlineOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Вопросы" />
            </ListItemButton>
            <ListItemButton onClick={() => console.log("Пользователи")}>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <PersonOutlineOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Пользователи" />
            </ListItemButton>
            <ListItemButton onClick={() => console.log("Уведомления")}>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <NotificationsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Уведомления" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                localStorage.removeItem("access_token");
                navigate("/");
              }}
            >
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <LogoutOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Выход" />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default LeftMenu;
