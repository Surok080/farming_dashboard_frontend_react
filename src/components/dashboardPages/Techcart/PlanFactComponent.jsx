import React, {useState} from "react";
import {dataCrop} from "../../../types";
import {Box, Grid, useMediaQuery, useTheme} from "@mui/material";
import CenterBlockPlan from "./CenterBlockPlan";
import LeftBlockPlanFact from "./LeftBlockPlanFact";
import PlanFactTitle from "./PlanFactTitle";

const PlanFactComponent = ({year}) => {
    const [data, setData] = useState(dataCrop);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    background: "#f0f0f0",
                    padding: "10px 10px 18px 10px",
                    overflowY: isSmallScreen ? "scroll" : "hidden"
                }}
            >
                <PlanFactTitle year={year}/>
                <Grid
                    sx={{height: isSmallScreen ? "auto" : "100%", paddingBottom: "20px", overflow: "hidden"}}
                    mt={1}
                    columns={12}
                    container
                    spacing={2}
                >
                    <Grid sx={{height: "100%", overflow: "hidden"}} item xs={isSmallScreen ? 12 : 4}>
                        <LeftBlockPlanFact year={year} data={data} setData={setData}/>
                    </Grid>
                    <Grid sx={{height: "100%", overflowY: "scroll"}} item xs={isSmallScreen ? 12 : 8}>
                        <CenterBlockPlan data={data}/>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default PlanFactComponent;
