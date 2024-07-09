import { Box, Grid, Paper, styled, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import PlanTitle from "./PlanTitle";
import LeftBlockPlan from "./LeftBlockPlan";
import CenterBlockPlan from "./CenterBlockPlan";
import { TehMapApi } from "../../../api/tehMap";
import { dataCrop } from "../../../types";

const PlanComponent = ({ year, fact }) => {
  const [crops, setCrops] = useState([]);
  const [data, setData] = useState(dataCrop);

  useEffect(() => {
    try {
      TehMapApi.getCrops(year, fact) 
      .then((res) => {
        setCrops(res.data)
      })
    } catch (e) {
      console.log(e);
    }

  }, [year, fact]);

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
      <Grid
        sx={{ height: "100%", paddingBottom: "20px", overflow: "hidden" }}
        mt={1}
        columns={12}
        container
        spacing={2}
      >
        <Grid sx={{ height: "100%", overflow: "hidden" }} item xs={4}>
          <LeftBlockPlan crops={crops} year={year} fact={fact} data={data} setData={setData}/>
        </Grid>
        <Grid sx={{height: '100%', overflowY: 'scroll'}} item xs={8}>
          <CenterBlockPlan data={data}/>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlanComponent;
