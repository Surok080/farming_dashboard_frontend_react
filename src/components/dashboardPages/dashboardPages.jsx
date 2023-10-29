import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect } from "react";
import Meteo from "../Meteo";

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
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const DashboardPages = () => {
  const [value, setValue] = React.useState("0");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={9}>
        <Box sx={{ width: "100%", padding: "0" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Пашня" value="0" />
              <Tab label="Пашня 1" value="1" />
              <Tab label="Пашня 2" value="2" />
            </Tabs>
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
              Container
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
              Container 1
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
              Container 2
            </Box>
          </CustomTabPanel>
        </Box>
      </Grid>

      <Grid item xs={3} sx={{ padding: '10px' }}>
        <Meteo />
      </Grid>
    </Grid>
  );
};

export default DashboardPages;
