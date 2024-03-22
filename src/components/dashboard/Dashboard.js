import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import { Context } from "../../store/context";
import DashboardPages from "../dashboardPages/dashboardPages";
import FieldsPages from "../dashboardPages/fieldsPages";
import { useDispatch, useSelector } from "react-redux";
import { SignInApi } from "../../api/singIn";
import { setUserFio } from "../../store/userDto";
import { useNavigate } from "react-router-dom";
import AppBarHeader from "../AppBarHeader";
import LeftMenu from "../LeftMenu";
import StateMonitoringPages from "../dashboardPages/StateMonitoringPages";
import CartogramsPage from "../dashboardPages/CartogramsPage";

export const drawerWidth = 180;



const defaultTheme = createTheme({
  palette: {
    primary: {
      main: "#82F865",
    },
  },
});

export default function Dashboard() {
  const user = useSelector((state) => state.user.fio);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [valueTabs, setValueTabs] = React.useState("menu_fields");
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(2024);
  const [allArea, setAllArea] = React.useState(null);

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


  function getPagesDashboard() {
    switch (valueTabs) {
      case "menu_dashboard":
        return <FieldsPages />;
      case "menu_fields":
        return <DashboardPages setAllArea={setAllArea} year={year} />;
      case "menu_gos":
        return <StateMonitoringPages setAllArea={setAllArea} year={year} />;
      case "menu_сartograms":
        return <CartogramsPage setAllArea={setAllArea} year={year} />;

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
          <AppBarHeader allArea={allArea} valueTabs={valueTabs} year={year} user={user} setYear={setYear}/>
          <LeftMenu/>
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
              maxWidth={false}
              style={{ padding: "0" }}
              sx={{
                maxWidth: "100%",
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
