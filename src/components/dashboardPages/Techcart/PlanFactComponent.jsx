import React, { useEffect, useState } from 'react';
import { dataCrop } from '../../../types';
import { TehMapApi } from '../../../api/tehMap';
import { Box, Grid } from '@mui/material';
import PlanTitle from './PlanTitle';
import CenterBlockPlan from './CenterBlockPlan';
import LeftBlockPlanFact from './LeftBlockPlanFact';


const PlanFactComponent = ({year}) => {

  const [data, setData] = useState(dataCrop);

  return (
    <>
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
          <LeftBlockPlanFact year={year}  data={data} setData={setData}/>

        </Grid>
        <Grid sx={{height: '100%', overflowY: 'scroll'}} item xs={8}>
          <CenterBlockPlan data={data}/>
        </Grid>
      </Grid>
    </Box> 
    </>
  );
};

export default PlanFactComponent;
