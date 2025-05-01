import { Box, Typography } from "@mui/material";
import React from "react";

const PlanFactTitle = ({ year }) => {
  return (
    <Box display={"flex"} gap={2}>
      <Typography
        sx={{ background: "#62A65D", color: "white", padding: "2px 5px" }}
        variant="body2"
        textAlign={"left"}
      >
        Посевная-{year}
      </Typography>
      <Typography variant="body2" textAlign={"left"}>
        План-фактный анализ деятельности в растениеводстве (источник данных 1С
        Предприяти 8)
      </Typography>
    </Box>
  );
};

export default PlanFactTitle;
