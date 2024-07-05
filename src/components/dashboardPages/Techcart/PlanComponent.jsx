import { Box, Grid, Paper, styled, Typography } from "@mui/material";
import React from "react";
import PlanTitle from "./PlanTitle";
import LeftBlockPlan from "./LeftBlockPlan";



const PlanComponent = ({ year }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: "#f0f0f0",
        padding: "10px 10px 18px 10px",
      }}
    >
      <PlanTitle year={year} />
      <Grid sx={{height: '100%', paddingBottom:'20px'}} mt={1} columns={12} container spacing={2}>
        <Grid item xs={4}>
          <Box sx={{height: '100%'}}>
            <LeftBlockPlan/>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box  sx={{ height: '100%'}}>xs=2</Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ height: '100%'}}>xs=3</Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlanComponent;
