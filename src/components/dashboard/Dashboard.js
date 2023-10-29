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
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import ListItems from "./listItems";

import { Context } from "../../store/context";
import DashboardPages from "../dashboardPages/dashboardPages";
import FieldsPages from "../dashboardPages/fieldsPages";
import { useDispatch, useSelector } from "react-redux";
import { SignInApi } from "../../api/singIn";
import { setUserFio } from "../../store/userDto";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const drawerWidth = 240;

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

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function Dashboard() {
  const user = useSelector((state) => state.user.fio);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [valueTabs, setValueTabs] = React.useState("menu_dashboard");
  const [open, setOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      SignInApi.getMe().then((user) => {
        setLoading(false);
        dispatch(
          setUserFio(`${user.data.first_name + " " + user.data.last_name}`)
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
        return "Дашборд";
        break;
      case "menu_fields":
        return "Поля";
        break;

      default:
        break;
    }
  }

  function getPagesDashboard() {
    switch (valueTabs) {
      case "menu_dashboard":
        return <DashboardPages />;
        break;
      case "menu_fields":
        return <FieldsPages />;
        break;

      default:
        break;
    }
  }

  if (loading) {
    return <>loading</>;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Context.Provider value={{ valueTabs, setValueTabs }}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: "24px", // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                {getNameTabs()}
              </Typography>
              {user ?? ""}
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                paddingBottom: "50px",
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
                  <IconButton onClick={toggleDrawer}>
                    <ChevronLeftIcon />
                  </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                  <ListItems />
                  {/* {mainListItems} */}

                  <Divider sx={{ my: 1 }} />
                </List>
              </Box>
              <Button
                onClick={() => {
                  localStorage.removeItem("access_token");
                  dispatch(setUserFio(``));
                  navigate("/");
                }}
              >
                Выход
              </Button>
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
            <Container maxWidth="lg" sx={{ marginTop: "24px" }}>
              {getPagesDashboard()}
            </Container>
          </Box>
        </Box>
      </Context.Provider>
    </ThemeProvider>
  );
}
