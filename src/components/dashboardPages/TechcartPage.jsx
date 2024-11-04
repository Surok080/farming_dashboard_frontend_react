import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab, Typography} from "@mui/material";
import React, {useState} from "react";
import PlanComponent from "./Techcart/PlanComponent";
import FactComponent from "./Techcart/FactComponent";

const TechcartPage = ({year}) => {
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{height: '100%'}}>
            <TabContext value={value}>
                <Box sx={{borderBottom: 1, borderColor: "divider", position: "relative"}}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab sx={{color: 'black !important'}} label="Плановый" value="1"/>
                        <Tab sx={{color: 'black !important'}} label="Фактический" value="2"/>
                    </TabList>
                    {
                        value === '2' && <Typography sx={{position: "absolute", right: 0, top: 0}} variant={"body2"}>
                            Обновление данных каждые 30 минут
                        </Typography>
                    }

                </Box>
                <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="1">
                    <PlanComponent year={year} fact={value === '2'}/>
                </TabPanel>
                <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="2">
                    <FactComponent year={year} fact={value === '2'}/>
                </TabPanel>
            </TabContext>
        </Box>
    );
};

export default TechcartPage;
