import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const Meteo = () => {
    const [city, setCity] = useState("");
    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {
        updateWeather();
        const interval = setInterval(() => {
            updateWeather();
        }, 100000); // Обновляем каждые 100 секунд

        return () => clearInterval(interval);
    }, []);

    function updateWeather() {
        fetch(
            "https://api.openweathermap.org/data/2.5/weather?lat=55.9685263&lon=49.42067429999999&lang=ru&units=metric&appid=7d805bb1253aca5ed8f8a5bba0fb6f04"
        )
            .then((res) => res.json())
            .then(
                (result) => {
                    setCity(result.name);
                    setWeatherData(result);
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    return (
        <Box sx={{overflowY: 'scroll'}}>
            <Typography variant="h6">{city}</Typography>
            {weatherData && (
                <List sx={{ width: "100%" }}>
                    <ListItem sx={{display: 'flex', flexDirection: 'column', padding: '0 16px'}}>
                        <ListItemIcon>
                            {/* Иконка погоды */}
                            <img
                                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                alt="Weather Icon"
                            />
                        </ListItemIcon>
                        <Box display="flex" justifyContent="space-between" width={"100%"}>
                            <Typography variant={"caption"}>
                                {`Температура: `}
                            </Typography>
                            <Typography variant={"caption"}>
                                {`${weatherData.main.temp}° C`}
                            </Typography>
                        </Box>

                    </ListItem>
                    <ListItem sx={{padding: '0 16px'}}>
                        <Box display="flex" justifyContent="space-between" width={"100%"}>
                            <Typography variant={"caption"}>
                                {`По ощущениям: `}
                            </Typography>
                            <Typography variant={"caption"}>
                                {`${weatherData.main.feels_like}° C`}
                            </Typography>
                        </Box>
                    </ListItem>
                    <ListItem sx={{padding: '0 16px'}}>
                        <Box display="flex" justifyContent="space-between" width={"100%"}>
                            <Typography variant={"caption"}>
                                {`Влажность: `}
                            </Typography>
                            <Typography variant={"caption"}>
                                {`${weatherData.main.humidity}%`}
                            </Typography>
                        </Box>
                    </ListItem>
                    <ListItem sx={{padding: '0 16px'}}>
                        <Box display="flex" justifyContent="space-between" width={"100%"}>
                            <Typography variant={"caption"}>
                                {`Описание: `}
                            </Typography>
                            <Typography variant={"caption"}>
                                {`${
                                    weatherData.weather[0].description.charAt(0).toUpperCase() +
                                    weatherData.weather[0].description.slice(1)
                                }`}
                            </Typography>
                        </Box>
                    </ListItem>
                </List>
            )}
        </Box>
    );
};

export default Meteo;