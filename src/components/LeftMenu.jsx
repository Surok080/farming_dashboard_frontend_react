import {Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,} from "@mui/material";
import React from "react";
import ListItems from "./dashboard/listItems";
import {useNavigate} from "react-router-dom";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MuiDrawer from "@mui/material/Drawer";
import styled from "@emotion/styled";
import logo from "../images/agro_logo.svg"
import {defaultTheme} from "./dashboard/Dashboard";


const LeftMenu = ({drawerWidth}) => {
    const navigate = useNavigate();

    const Drawer = styled(MuiDrawer, {
        shouldForwardProp: (prop) => prop !== "open",
    })(({theme, open}) => ({
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
                        background: "#F0F0F0",
                        overflow: "hidden",
                    }}
                >
                    <Box display="flex" flexDirection={"column"} height={"100%"}>
                        <Toolbar
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                px: [1],
                            }}
                        >
                            <img src={logo} width={34} height={27} alt="logo"/>
                        </Toolbar>
                        <Divider/>
                        <List sx={{paddingTop: "10px"}} component="nav">
                            <Box height={"50px"}>
                                <Typography
                                    component="h2"
                                    variant="h6"
                                    color="inherit"
                                    noWrap
                                    sx={{flexGrow: 1,
                                        [defaultTheme.breakpoints.down("lg")]: {
                                            fontSize: "14px",
                                        },
                                    }}
                                    textAlign={"center"}
                                >
                                    Агро-Коннект
                                </Typography>
                            </Box>

                            <ListItems/>
                            <Divider sx={{my: 1}}/>
                        </List>
                    </Box>
                    <Box>
                        <ListItemButton
                            onClick={() => {
                                localStorage.removeItem("access_token");
                                localStorage.removeItem("refresh_token");
                                navigate("/");
                            }}
                        >
                            <ListItemIcon sx={{minWidth: "36px"}}>
                                <LogoutOutlinedIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Выход"/>
                        </ListItemButton>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default LeftMenu;
