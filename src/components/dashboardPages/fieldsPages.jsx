import { Box, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect } from "react";
// import TabPanel from "@mui/lab/TabPanel";

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
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const FieldsPages = () => {
  const [value, setValue] = React.useState("0");


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Item One" value="0" />
          <Tab label="Item Two" value="1" />
          <Tab label="Item Three" value="2" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={"0"}>
        Item One
      </CustomTabPanel>
      <CustomTabPanel value={value} index={"1"}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={"2"}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
};

export default FieldsPages;
