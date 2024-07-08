import React, { useEffect, useState } from 'react';
import { dataCrop } from '../../../types';
import { TehMapApi } from '../../../api/tehMap';
import { Box, Grid } from '@mui/material';
import LeftBlockPlan from './LeftBlockPlan';
import CenterBlockPlan from './CenterBlockPlan';
import FactTitle from './FactTitle';
import LeftBlockFact from './LeftBlockFact';
import CenterBlockFackt from './CenterBlockFackt';

const FactComponent = ({ year, fact }) => {
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
      <FactTitle year={year} />
      <Grid
        sx={{ height: "100%", paddingBottom: "20px", overflow: "hidden" }}
        mt={1}
        columns={12}
        container
        spacing={2}
      >
        <Grid sx={{ height: "100%", overflow: "hidden" }} item xs={4}>
          <LeftBlockFact crops={crops} year={year} fact={fact} data={data} setData={setData}/>
        </Grid>
        <Grid item xs={8}>
          <CenterBlockFackt data={data}/>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FactComponent;
