import {Box, Divider, FormControl, InputLabel, Link, MenuItem, Select, Toolbar, Typography,} from "@mui/material";
import React, {memo, useEffect} from "react";
import MuiAppBar from "@mui/material/AppBar";
import styled from "@emotion/styled";
import {useNavigate} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import {useSelector} from "react-redux";
import {defaultTheme} from "./dashboard/Dashboard";
import logo from "../images/agro_logo.svg"


const StyledAppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerwidth",
})(({ theme, open, drawerwidth }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerwidth,
        width: `calc(100% - ${drawerwidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const AppBarHeader = memo(({valueTabs, year, setYear, allArea, drawerWidth}) => {
    const navigate = useNavigate();
    const [anchorElUserInfo, setAnchorElUserInfo] = React.useState(null);
    const openUserInfo = Boolean(anchorElUserInfo);
    const [anchorElHelp, setAnchorElHelp] = React.useState(null);
    const openHelp = Boolean(anchorElHelp);
    const user = useSelector((state) => state.user);
    const userFio = user?.fio;

    const handleClickUserInfo = (event) => {
        setAnchorElUserInfo(event.currentTarget);
    };
    const handleCloseUserInfo = () => {
        setAnchorElUserInfo(null);
    };

    const handleClickHelp = (event) => {
        setAnchorElHelp(event.currentTarget);
    };
    const handleCloseHelp = () => {
        setAnchorElHelp(null);
    };

    const refreshPage = () => {
        navigate(0);
    }

    const handleChangeYear = (e) => {
        setYear(e.target.value);
        localStorage.setItem('year', e.target.value);
        // refreshPage();
    };

    function getNameTabs() {
        switch (valueTabs) {
            case "dashboard":
                return "Обзор";
            case "tech_map":
                return "ТехКарта";
            case "fields":
                return "Поля";
            case "state_monitoring":
                return "Госмониторинг";
            case "cartogram":
                return "Картограммы";
            case "menu_settings":
                return "Настройки";
            default:
                break;
        }
    }

    return (
        <>
            <StyledAppBar
                position="absolute"
                drawerwidth={drawerWidth}
                sx={{
                    boxShadow: "none",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                    background: "#f0f0f0",
                }}
            >

                <Toolbar
                    sx={{
                        pr: "24px",
                    }}
                >
                    <img src={logo} width={'30px'} height={'30px'} alt={"logo"} />
                    <Typography
                        component="h1"
                        variant="h5"
                        color="inherit"
                        noWrap
                        sx={{
                            ml: `calc(${drawerWidth}px - 30px)`,
                            flexGrow: 1,
                            boxShadow: "none",
                            display: "flex",
                            gap: "20px",
                            [defaultTheme.breakpoints.down("lg")]: {
                            fontSize: '16px',
                        },
                        }}
                        textAlign={"left"}
                        alignItems={"center"}
                    >
                        {getNameTabs()}
                        {valueTabs === "fields" && allArea ? (
                            <Typography color={"grey"}>{allArea} га</Typography>
                        ) : null}
                    </Typography>
                    <Box sx={{minWidth: 120, marginRight: "20px"}}>
                        <FormControl fullWidth>
                            <InputLabel id="select-label">Год</InputLabel>
                            <Select
                                size={"small"}
                                labelId="select-label"
                                id="simple-select"
                                value={year}
                                label="year"
                                onChange={handleChangeYear}
                            >
                                <MenuItem value={2025}>2025</MenuItem>
                                <MenuItem value={2024}>2024</MenuItem>
                                <MenuItem value={2023}>2023</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <IconButton
                        onClick={handleClickHelp}
                        size="small"
                        sx={{ml: 2}}
                        aria-controls={openHelp ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openHelp ? 'true' : undefined}
                    >
                        <HelpOutlineIcon
                            sx={{width: 32, height: 32}}/>
                    </IconButton>
                    <IconButton
                        onClick={handleClickUserInfo}
                        size="small"
                        sx={{ml: 2}}
                        aria-controls={openUserInfo ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openUserInfo ? 'true' : undefined}
                    >
                        <Avatar
                            sx={{width: 32, height: 32}}>{userFio.split(' ').slice(0,2).map(word => word.charAt(0)).join('')}</Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorElUserInfo}
                        id="account-menu"
                        open={openUserInfo}
                        onClose={handleCloseUserInfo}
                        onClick={handleCloseUserInfo}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            },
                        }}
                        transformOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    >
                        <Typography fontWeight={"bold"} ml={2} variant={'subtitle1'}>Организация</Typography>
                        <Typography m={2} mt={1}>
                            {user.userInfo.organization}
                        </Typography>
                        <Divider/>
                        <Typography fontWeight={"bold"} ml={2} variant={'subtitle1'}>Аккаунт</Typography>
                        <Box m={2} mt={1} alignItems={"center"} display={"flex"}> <Avatar
                            sx={{width: 32, height: 32}}>{userFio.split(' ').slice(0,2).map(word => word.charAt(0)).join('')}</Avatar>
                            <Box>
                                <Typography >
                                    {userFio}
                                </Typography>
                                <Typography >
                                    {user.userInfo.email}
                                </Typography>
                            </Box>
                            </Box>

                    </Menu>


                    <Menu
                        anchorEl={anchorElHelp}
                        id="account-menu"
                        open={openHelp}
                        onClose={handleCloseHelp}
                        onClick={handleCloseHelp}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            },
                        }}
                        transformOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    >
                        <Typography fontWeight={"bold"} ml={2} variant={'subtitle1'}>Поддержка</Typography>
                        <MenuItem onClick={handleCloseHelp}>
                            <InfoOutlineIcon/> <Link ml={1} color={"black"} target={"_blank"} href="https://docs.google.com/document/d/194Yvd-p-elYzfjQyxyI9gugwAeEA2L3tKs76cgQc63g/edit?usp=sharing" underline="none">
                            {'База знаний'}
                        </Link>
                        </MenuItem>
                        <Divider/>
                        <Typography fontWeight={"bold"} ml={2} variant={'subtitle1'}>Связаться с нами</Typography>
                        <MenuItem onClick={handleCloseHelp}>
                            <InfoOutlineIcon/> <Link ml={1} color={"black"} target={"_blank"} href="mailto:sof-it.tech@yandex.ru" underline="none">
                            {'sof-it.tech@yandex.ru'}
                        </Link>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </StyledAppBar>
        </>
    );
});

export default AppBarHeader;
