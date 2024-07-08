import { Box, Tooltip, Typography } from "@mui/material";
import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

const CenterBlockFackt = ({ data }) => {
  const uData = [
    data.consumption.seeds_kg,
    data.consumption.fertilizers_kg,
    data.consumption.fertilizers_l,
    data.consumption.shzr_kg,
    data.consumption.shzr_l,
    data.consumption.fuel_l,
    data.consumption.products_kg,
    data.consumption.other_expenses,
  ];
  const xLabels = [
    "Семена, кг",
    "Мин.удобрения, кг",
    "Удобрения, л",
    "СХЗР, кг",
    "СХЗР, л",
    "ГСМ, л",
    "Продукция, кг",
    "Прочие затраты",
  ];

  return (
    <Box display={"flex"} flexDirection={"column"} gap={1} minHeight={"100%"}>
      <Box display={"flex"}>
        <Box
          sx={{
            background: "#F9F9F9",
            border: "1px solid #bfbfbf",
            borderRadius: "4px",
            overflowY: "scroll",
            padding: 0,
            flexDirection: "column",
          }}
          display={"flex"}
          width={"100%"}
        >
          <Box p={2} sx={{ background: "#62A65D" }} textAlign={'start'} width={"100%"}>
            <Typography
              textAlign={'left'}
              sx={{ fontWeight: "bold", color: "white" }}
              variant="body"
            >
              Технологические операции
            </Typography>
          </Box>

          <Box p={2} display={"flex"} flexDirection={"column"} gap={2}></Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CenterBlockFackt;
