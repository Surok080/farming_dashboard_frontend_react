import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect } from "react";
import Meteo from "../Meteo";
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

const DashboardPages = ({year}) => {
  return (
    <Grid sx={{ height: "100%", }} container spacing={3}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "600px",
            background: "#9797971c",
            position: "relative",
            width: "100%",
            padding: "0",
            height: "100%",
            overflow: 'hidden'
          }}
        >
          <Map year={year}/>
        </Box>
      </Grid>
    </Grid>
  );
};

export default DashboardPages;
