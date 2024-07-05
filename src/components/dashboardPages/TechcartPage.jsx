import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import React, { useState } from "react";
import PlanComponent from "./Techcart/PlanComponent";

const TechcartPage = ({year}) => {
  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{height: '100%'}}>
      <TabContext value={value} >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab sx={{color: 'black !important'}} label="Плановый" value="1" />
            <Tab sx={{color: 'black !important'}} label="Фактический" value="2" />
          </TabList>
        </Box>
        <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="1">
          <PlanComponent year={year}/>
        </TabPanel>
        <TabPanel value="2">Item Two</TabPanel>
      </TabContext>
    </Box>
  );
};

export default TechcartPage;
