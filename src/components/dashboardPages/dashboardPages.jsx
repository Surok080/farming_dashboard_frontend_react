import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect } from "react";
import Meteo from "../Meteo";
import Test from "../Test";
import { styled } from "@mui/material/styles";
import Map from "../map/Map";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const DashboardPages = () => {
  const [value, setValue] = React.useState("0");
  const TabsStyle = (valueRef) => ({
    color: "black",
    border: "1px solid grey",
    padding: "20px 15px",
    borderRadius: "5px",
    background: value == valueRef ? "#8080801f" : "none",
    transition: "all .2s linear",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={9}>
        <Box sx={{ width: "100%", padding: "0" }}>
          <Box
            sx={{
              margin: "10px 0 50px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={TabsStyle("0")} onClick={() => setValue("0")}>
              <Typography>Пашня</Typography>
              <Typography>16000Га</Typography>
            </Box>
            <Box sx={TabsStyle("1")} onClick={() => setValue("1")}>
              <Typography>Структура посевов</Typography>
              <Typography>5 культур</Typography>
            </Box>
            <Box sx={TabsStyle("2")} onClick={() => setValue("2")}>
              <Typography>Ход полевых работ</Typography>
            </Box>
            <Box sx={TabsStyle("3")} onClick={() => setValue("3")}>
              <Typography>Оперативная отчетность</Typography>
            </Box>
          </Box>
          <CustomTabPanel value={value} index={"0"}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "50px",
                minHeight: "400px",
                background: "#9797971c",
              }}
            >
            <Map/>

            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={"1"}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "50px",
                minHeight: "400px",
                background: "#9797971c",
              }}
            >
              <Test/>
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={"2"}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "50px",
                minHeight: "400px",
                background: "#9797971c",
              }}
            >
              Container 1
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={"3"}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "50px",
                minHeight: "400px",
                background: "#9797971c",
              }}
            >
              Container 2
            </Box>
          </CustomTabPanel>
        </Box>
      </Grid>

      <Grid item xs={3} sx={{ padding: "10px" }}>
        <Meteo />
      </Grid>
    </Grid>
  );
};

export default DashboardPages;
