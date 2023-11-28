import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const Meteo = () => {
  const [city, setCity] = useState("");
  const [meteoData, setMeteoData] = useState([]);

  useEffect(() => {
    updateMeteo();
    console.log('updateMeteo()');
    const interval = setInterval(() => {
      updateMeteo()
    }, 100000);

    return () => clearInterval(interval);
  }, []);

  function updateMeteo() {
    fetch(
      // https://api.openweathermap.org/data/3.0/onecall/day_summary?lat={lat}&lon={lon}&date={date}&appid={API key}
       "https://api.openweathermap.org/data/2.5/forecast?lat=55.9685263&lon=49.42067429999999&lang=ru&limit=5&units=metric&appid=7d805bb1253aca5ed8f8a5bba0fb6f04"
      // "https://api.openweathermap.org/data/2.5/onecall/day_summary?lat=60.45&lon=-38.67&date=2023-03-30&tz=+03:00&appid=7d805bb1253aca5ed8f8a5bba0fb6f04"
    )
      .then((res) => res.json())
      .then(
        (result) => {
          setCity(result.city.name);
          setMeteoData(result.list.slice(0, 5));
        },
        (error) => {
          console.log(error);
        }
      );
  }

  return (
    <Box>
      <Typography variant="h5">Погода</Typography>
      <Typography variant="h6">{city}</Typography>
      <List sx={{ width: "100%" }}>
        {meteoData.map((value, key) => (
          <Box  key={key}>
            <ListItem
              key={value.dt_txt + key}
              disableGutters
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <ListItemText>{`${value.dt_txt}`}</ListItemText>
              <ListItemText>{`${value.weather[0].description.charAt(0).toUpperCase() + value.weather[0].description.slice(1)}`}</ListItemText>
              <ListItemText>{`Температура ${value.main.temp}° C`}</ListItemText>
              <ListItemText>{`По ощущениям ${value.main.feels_like}° C`}</ListItemText>
              <ListItemText>{`Влажность ${value.main.humidity}%`}</ListItemText>
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default Meteo;
