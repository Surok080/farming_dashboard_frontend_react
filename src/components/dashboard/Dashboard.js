import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItems from "./listItems";
import { Context } from "../../store/context";
import DashboardPages from "../dashboardPages/dashboardPages";
import FieldsPages from "../dashboardPages/fieldsPages";
import { useDispatch, useSelector } from "react-redux";
import { SignInApi } from "../../api/singIn";
import { setUserFio } from "../../store/userDto";
import { useNavigate } from "react-router-dom";
import Logo from "../../images/logo.svg";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ListItemText from "@mui/material/ListItemText";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const drawerWidth = 180;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

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

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: "#F0F0F0",
    },
  },
});

export default function Dashboard() {
  const user = useSelector((state) => state.user.fio);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [valueTabs, setValueTabs] = React.useState("menu_fields");
  const [open, setOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(2023);

  React.useEffect(() => {
    try {
      SignInApi.getMe().then((user) => {
        setLoading(false);
        dispatch(
          setUserFio(`${user?.data.first_name + " " + user?.data.last_name}`)
        );
      });
    } catch (error) {
      navigate("/");
    }
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
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

  function getPagesDashboard() {
    switch (valueTabs) {
      case "menu_dashboard":
        return <FieldsPages />;
        break;
      case "menu_fields":
        return <DashboardPages year={year} />;
        break;

      default:
        break;
    }
  }

  const handleChangeYear = (e) => {
    setYear(e.target.value);
  };

  if (loading) {
    return <>loading</>;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Context.Provider value={{ valueTabs, setValueTabs }}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar
            position="absolute"
            open={open}
            sx={{
              boxShadow: "none",
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
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
            open={open}
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
                >
                  {/* <IconButton onClick={toggleDrawer}>
                    <ChevronLeftIcon />
                  </IconButton> */}
                </Toolbar>
                <Divider />
                <List sx={{ paddingTop: "10px" }} component="nav">
                  <Box height={"50px"}>
                    {open ? (
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
                    ) : (
                      <img
                        style={{ margin: "15px 25px 15px 10px" }}
                        src={Logo}
                        alt="Logo"
                      />
                    )}
                  </Box>

                  <ListItems />
                  <Divider sx={{ my: 1 }} />
                </List>
              </Box>

              {/* <Button
                variant={"contained"}
                onClick={() => {
                  localStorage.removeItem("access_token");
                  dispatch(setUserFio(``));
                  navigate("/");
                }}
              >
                Выход
              </Button> */}
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
                <ListItemButton onClick={() => console.log("Выход")}>
                  <ListItemIcon sx={{ minWidth: "36px" }}>
                    <LogoutOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Выход" />
                </ListItemButton>
              </Box>
            </Box>
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Toolbar />
            <Container
              style={{ padding: "0" }}
              maxWidth="xl"
              sx={{
                marginTop: "20px",
                marginLeft: "200px",
                height: "calc(100% - 96px)",
                width: "calc(100% - 220px)",
                padding: "0",
              }}
            >
              {getPagesDashboard()}
            </Container>
          </Box>
        </Box>
      </Context.Provider>
    </ThemeProvider>
  );
}
