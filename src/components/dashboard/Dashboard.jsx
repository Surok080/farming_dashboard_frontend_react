import * as React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import {Context} from "../../store/context";
import DashboardPages from "../dashboardPages/dashboardPages";
import FieldsPages from "../dashboardPages/fieldsPages";
import {useDispatch, useSelector} from "react-redux";
import {SignInApi} from "../../api/singIn";
import {setUserFio} from "../../store/userDto";
import {setUserInfo} from "../../store/userDto";
import {useNavigate} from "react-router-dom";
import AppBarHeader from "../AppBarHeader";
import LeftMenu from "../LeftMenu";
import StateMonitoringPages from "../dashboardPages/StateMonitoringPages";
import CartogramsPage from "../dashboardPages/CartogramsPage";
import TechcartPage from "../dashboardPages/TechcartPage";
import SettingsPage from "../dashboardPages/SettingsPage";
import {useEffect} from "react";
import {useMediaQuery, useTheme} from "@mui/material";

export const defaultTheme = createTheme({
    palette: {
        primary: {
            main: "#62A65D",
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200, // теперь `lg` начинается с 1200px
            xl: 1536,
        },
    },
});

export default function Dashboard() {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [valueTabs, setValueTabs] = React.useState("dashboard");
    const [loading, setLoading] = React.useState(true);
    const [year, setYear] = React.useState(localStorage.getItem('year') ?? new Date().getFullYear());
    const [allArea, setAllArea] = React.useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg")); // md = 900px (по вашей теме)
    const drawerWidth = isSmallScreen ? 120 : 180; // Меняем ширину в зависимости от экрана

    useEffect(() => {
        if (localStorage.getItem('tabs') !== 'dashboard'
            && localStorage.getItem('tabs')
            && user?.userInfo?.module?.length > 0
            && user.userInfo.module.includes(localStorage.getItem('tabs'))) {
            setValueTabs(localStorage.getItem('tabs'))
        }
    }, [user]);

    React.useEffect(() => {

        if (Object.keys(user.userInfo).length === 0) {
            SignInApi.getMe()
                .then((user) => {
                    dispatch(
                        setUserFio(`${user?.data.first_name + " " + user?.data.last_name}`)
                    );
                    dispatch(setUserInfo(user?.data));
                    setTimeout(() => {
                        setLoading(false);
                    }, 100);

                })
                .catch(() => {
                    navigate("/");
                });
        } else {
            setLoading(false);
        }

    }, []);

    function getPagesDashboard() {
        switch (valueTabs) {
            case "dashboard":
                return <FieldsPages/>;
            case "tech_map":
                return <TechcartPage year={year}/>;
            case "fields":
                return <DashboardPages setAllArea={setAllArea} year={year}/>;
            case "state_monitoring":
                return <StateMonitoringPages setAllArea={setAllArea} year={year}/>;
            case "cartogram":
                return <CartogramsPage setAllArea={setAllArea} year={year}/>;
            case "menu_settings":
                return <SettingsPage setAllArea={setAllArea} year={year}/>;

            default:
                break;
        }
    }

    if (loading) {
        return <>loading</>;
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Context.Provider value={{valueTabs, setValueTabs}}>
                <Box sx={{display: "flex"}}>
                    <CssBaseline/>
                    <AppBarHeader
                        drawerWidth={drawerWidth}
                        allArea={allArea}
                        valueTabs={valueTabs}
                        year={year}
                        setYear={setYear}
                    />
                    <LeftMenu drawerWidth={drawerWidth}/>
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
                        <Toolbar/>
                        <Container
                            maxWidth={false}
                            style={{padding: "0"}}
                            sx={{
                                maxWidth: "100%",
                                marginTop: "20px",
                                marginLeft: "200px",
                                height: "calc(100% - 96px)",
                                width: "calc(100% - 220px)",
                                padding: "0",
                                overflow: 'hidden',
                                [theme.breakpoints.down("lg")]: {
                                    width: "calc(100% - 170px)",
                                    marginLeft: "145px",
                                },
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
