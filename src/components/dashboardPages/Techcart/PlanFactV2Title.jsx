import { Box, Typography } from "@mui/material";
import React from "react";

const PlanFactV2Title = ({ year }) => {
  return (
    <Box display={"flex"} gap={2} mb={2}>
      <Typography
        sx={{ 
          background: "#62A65D", 
          color: "white", 
          padding: "8px 16px",
          borderRadius: "4px",
          fontWeight: "bold",
          fontSize: "16px"
        }}
        variant="body1"
        textAlign={"left"}
      >
        Посевная-{year}
      </Typography>
      <Typography 
        variant="body1" 
        textAlign={"left"}
        sx={{ 
          color: "#333",
          fontSize: "14px",
          alignSelf: "center"
        }}
      >
        План-фактный анализ деятельности в растениеводстве (источник данных 1С Предприятие 8)
      </Typography>
    </Box>
  );
};

export default PlanFactV2Title;
