import React, { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Chart } from "react-google-charts";
import { CHART_COLORS } from "./warehouseAccountingConstants";
import { formatMoney, formatQuantities } from "./warehouseAccountingUtils";

const WarehouseAccountingChart = ({ stock }) => {
  const storages = stock?.storages ?? [];
  const chartData = useMemo(() => {
    if (!storages.length) return null;
    const data = [["Склад", "Сумма"]];
    storages.forEach((item) => data.push([item.storage_name, Number(item.amount) || 0]));
    return data;
  }, [storages]);
  const maxAmount = storages.reduce((max, item) => Math.max(max, Number(item.amount) || 0), 0);

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        width: { xs: "100%", lg: 360 },
        flexShrink: 0,
        borderColor: "#e0e0e0",
        boxShadow: "none",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
        Учёт запасов по складам (местам хранения)
      </Typography>
      {!storages.length || !chartData ? (
        <Typography sx={{ fontSize: 13, color: "#666" }}>Нет данных по складам</Typography>
      ) : (
        <>
          <Chart
            chartType="PieChart"
            data={chartData}
            options={{
              pieHole: 0.45,
              legend: "none",
              colors: CHART_COLORS,
              chartArea: { width: "90%", height: "90%" },
              pieSliceText: "none",
            }}
            width="100%"
            height="220px"
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            {storages.map((item, index) => {
              const color = CHART_COLORS[index % CHART_COLORS.length];
              const ratio = maxAmount ? (Number(item.amount) || 0) / maxAmount : 0;
              return (
                <Box key={item.storage_id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{item.storage_name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "#555", ml: 2.5 }}>
                    {formatQuantities(item.quantities)}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, ml: 2.5, mb: 0.5 }}>
                    {formatMoney(item.amount)}
                  </Typography>
                  <Box sx={{ ml: 2.5, height: 8, backgroundColor: "#eee", borderRadius: 1, overflow: "hidden" }}>
                    <Box sx={{ width: `${Math.round(ratio * 100)}%`, height: "100%", backgroundColor: color }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default WarehouseAccountingChart;
