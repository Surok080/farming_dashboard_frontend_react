import React, { useState } from "react";
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import PlanFactV2Title from "./PlanFactV2Title";
import LeftBlockPlanFactV2 from "./LeftBlockPlanFactV2";
import RightBlockPlanFactV2 from "./RightBlockPlanFactV2";

const PlanFactV2Component = ({ year }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedCultures, setSelectedCultures] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [planType, setPlanType] = useState("results_seva");

    const handleDataReceived = (data) => {
        setDashboardData(data);
    };

    const handleSelectionChange = (cultures, fields, techcardValue) => {
        setSelectedCultures(cultures);
        setSelectedFields(fields);
        setPlanType(techcardValue);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                width: "100%",
                height: "100%",
                background: "#f0f0f0",
                padding: "10px 10px 0px 10px",
                overflowY: isSmallScreen ? "scroll" : "hidden"
            }}
        >
            <PlanFactV2Title year={year} />
            <Grid
                sx={{ 
                    height: isSmallScreen ? "auto" : "100%", 
                    paddingBottom: "20px", 
                    overflow: "hidden" 
                }}
                mt={1}
                columns={12}
                container
                spacing={2}
            >
                <Grid 
                    sx={{ 
                        height: "100%", 
                        overflow: "hidden" 
                    }} 
                    item 
                    xs={isSmallScreen ? 12 : 4}
                >
                        <LeftBlockPlanFactV2 
                            year={year} 
                            onDataReceived={handleDataReceived}
                            onSelectionChange={handleSelectionChange}
                        />
                </Grid>
                <Grid 
                    sx={{ 
                        height: "100%", 
                        overflowY: "scroll" 
                    }} 
                    item 
                    xs={isSmallScreen ? 12 : 8}
                >
                        <RightBlockPlanFactV2 
                            dashboardData={dashboardData}
                            year={year}
                            planType={planType}
                            selectedCultures={selectedCultures}
                            selectedFields={selectedFields}
                        />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PlanFactV2Component;
