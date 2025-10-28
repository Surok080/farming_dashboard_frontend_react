import * as React from "react";
import {createContext, useState, useEffect} from "react";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {useNavigate} from "react-router-dom";
import {SignInApi} from "../api/singIn";
import LoadingButton from "@mui/lab/LoadingButton";
import {useSnackbar} from "notistack";
import {useDispatch, useSelector} from "react-redux";
import {setUserFio, setUserInfo} from "../store/userDto";
import logo from "../images/agro_logo.svg";
import { CircularProgress } from "@mui/material";

export const StoreContext = createContext("light");

export default function SignIn() {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [userDto, setUserDto] = useState(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // Проверка refresh токена при загрузке компонента
  useEffect(() => {
    const checkRefreshToken = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Пытаемся обновить токен
          await SignInApi.refreshToken();
          
          // Если токен обновился успешно, получаем информацию о пользователе
          const userResponse = await SignInApi.getMe();
          
          if (userResponse?.status === 200) {
            setUserDto(userResponse.data);
            dispatch(setUserFio(`${userResponse.data.first_name + ' ' + userResponse.data.last_name}`));
            dispatch(setUserInfo(userResponse.data));
            
            enqueueSnackbar("Добро пожаловать обратно", {
              autoHideDuration: 3000,
              variant: "success",
            });
            
            // Перенаправляем в дашборд
            navigate("/dashboard");
            return;
          }
        } catch (error) {
          // Если не удалось обновить токен, очищаем localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          console.log('Не удалось обновить токен:', error);
        }
      }
      
      // Если нет токена или не удалось его обновить, показываем форму авторизации
      setIsCheckingToken(false);
    };

    checkRefreshToken();
  }, [dispatch, navigate, enqueueSnackbar]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userDto = {
      username: data.get("email"),
      password: data.get("password"),
    };

    setLoad(true);
    SignInApi.auth(userDto)
      .then((res) => {
        if (res?.status === 200) {
          SignInApi.getMe().then((user) => {
            setLoad(false);
            setUserDto(user.data);
            dispatch(setUserFio(`${user.data.first_name + ' ' + user.data.last_name}`))
            dispatch(setUserInfo(user?.data));
            enqueueSnackbar("Добро пожаловать", {
              autoHideDuration: 4000,
              variant: "success",
            });

            navigate("/dashboard");
          }).catch((error) => {
            setLoad(false);
            console.error('Ошибка получения данных пользователя:', error);
            enqueueSnackbar("Ошибка получения данных пользователя", {
              autoHideDuration: 4000,
              variant: "error",
            });
          });
        } else if (res?.status === 403) {
          setLoad(false);
          enqueueSnackbar("Доступ запрещен", {
            autoHideDuration: 4000,
            variant: "warning",
          });
        } else {
          setLoad(false);
          enqueueSnackbar("Что-то пошло не так", {
            autoHideDuration: 4000,
            variant: "error",
          });
        }
      })
      .catch((error) => {
        setLoad(false);
        console.error('Ошибка авторизации:', error);
        
        // Обработка различных типов ошибок
        if (error?.response?.status === 401) {
          enqueueSnackbar("Неверный логин или пароль", {
            autoHideDuration: 4000,
            variant: "error",
          });
        } else if (error?.response?.status === 403) {
          enqueueSnackbar("Доступ запрещен", {
            autoHideDuration: 4000,
            variant: "warning",
          });
        } else if (error?.response?.status >= 500) {
          enqueueSnackbar("Ошибка сервера. Попробуйте позже", {
            autoHideDuration: 4000,
            variant: "error",
          });
        } else if (error?.message === 'Network Error' || !error?.response) {
          enqueueSnackbar("Ошибка подключения к серверу", {
            autoHideDuration: 4000,
            variant: "error",
          });
        } else {
          enqueueSnackbar("Не удалось авторизоваться", {
            autoHideDuration: 4000,
            variant: "error",
          });
        }
      });
  };

  // Показываем индикатор загрузки во время проверки токена
  if (isCheckingToken) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }} variant="body1">
            Проверка авторизации...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <StoreContext.Provider value={{ userDto, setUserDto }}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}> */}
            <img width={80} src={logo} alt="logo" />
          {/* </Avatar> */}
          <Typography mt={2} component="h1" variant="h5">
            Авторизация
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Логин"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <LoadingButton
              loading={load}
              variant="contained"
              fullWidth
              type="submit"
            >
              Авторизоваться
            </LoadingButton>
            {/* <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Авторизоваться
          </Button> */}
            <Typography mt={4} component="h2" variant="subtitle1">
              Система управления сельским хозяйством
            </Typography>
          </Box>
        </Box>
      </Container>
    </StoreContext.Provider>
  );
}
