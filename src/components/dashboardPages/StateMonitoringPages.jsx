import { Box, Grid } from "@mui/material";
import React from "react";
import Map from "../map/Map";
import MapState from "../map/MapState";


const StateMonitoringPages = ({year, setAllArea}) => {
  return (
    <Grid sx={{ height: "100%", }} container spacing={3}>
      <Grid height={'100%'} item xs={12}>
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
          <MapState/>
        </Box>
      </Grid>
    </Grid>
  );
};

export default StateMonitoringPages;
