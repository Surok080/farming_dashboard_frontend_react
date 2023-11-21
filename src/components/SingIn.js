import * as React from "react";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router-dom";
import { SignInApi } from "../api/singIn";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { createContext } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { setUserFio } from "../store/userDto";

export const StoreContext = createContext("light");

export default function SignIn() {
  const user = useSelector((state) => state.user.fio)
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [userDto, setUserDto] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userDto = {
      username: data.get("email"),
      password: data.get("password"),
    };

    setLoad(true);
    try {
      SignInApi.auth(userDto).then((res) => {
        if (res.status === 200) {
          SignInApi.getMe().then((user) => {
            setLoad(false);
            setUserDto(user.data);
            dispatch(setUserFio(`${user.data.first_name + user.data.last_name}`))
            enqueueSnackbar("Добро пожаловать", {
              autoHideDuration: 1000,
              variant: "success",
            });

            navigate("/jurnal");
          });
        } else if (res.status === 403) {
          enqueueSnackbar("Доступ запрещен", {
            autoHideDuration: 3000,
            variant: "warning",
          });
        } else {
          enqueueSnackbar("Что-то пошло не так", {
            autoHideDuration: 3000,
            variant: "error",
          });
        }
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoad(false);
    }
  };

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
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <AgricultureIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Авторизация Дашборд
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
          </Box>
        </Box>
      </Container>
    </StoreContext.Provider>
  );
}
