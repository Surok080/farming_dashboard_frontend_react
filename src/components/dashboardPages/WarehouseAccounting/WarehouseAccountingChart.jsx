import React, { useMemo } from "react";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { Chart } from "react-google-charts";
import { CHART_COLORS } from "./warehouseAccountingConstants";
import { formatMoney, formatQuantities } from "./warehouseAccountingUtils";

const WarehouseAccountingChart = ({ stock, loading }) => {
  const storages = Array.isArray(stock?.storages) ? stock.storages : [];
  const chartStorages = useMemo(
    () => storages.filter((item) => Number(item.amount) > 0),
    [storages]
  );
  const chartData = useMemo(() => {
    if (!chartStorages.length) return null;
    const data = [["Склад", "Сумма"]];
    chartStorages.forEach((item) => data.push([item.storage_name, Number(item.amount) || 0]));
    return data;
  }, [chartStorages]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        width: "100%",
        height: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        borderColor: "#e6ecf2",
        borderRadius: "10px",
        boxShadow: "none",
        overflow: "auto",
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.25, color: "#2f3743", textAlign: "center" }}>
        Учёт запасов
      </Typography>
      <Typography sx={{ fontSize: 13, mb: 1.25, color: "#2f3743", textAlign: "center", lineHeight: 1.35 }}>
        По складам (местам хранения)
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 4 }}>
          <CircularProgress size={22} />
          <Typography sx={{ fontSize: 13, color: "#666" }}>Загрузка…</Typography>
        </Box>
      ) : !chartStorages.length || !chartData ? (
        <Typography sx={{ fontSize: 13, color: "#666" }}>Нет данных по складам</Typography>
      ) : (
        <>
          <Chart
            chartType="PieChart"
            data={chartData}
            loader={<CircularProgress size={22} />}
            options={{
              pieHole: 0.72,
              legend: "none",
              colors: CHART_COLORS,
              chartArea: { width: "88%", height: "88%" },
              pieSliceText: "none",
              tooltip: { text: "both" },
              pieStartAngle: 270,
              backgroundColor: "transparent",
            }}
            width="100%"
            height="210px"
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 1, mt: 1, alignItems: "start" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#7f8997" }}>Склад</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#7f8997", textAlign: "right" }}>
              Количество
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#7f8997", textAlign: "right" }}>Сумма</Typography>
            {chartStorages.map((item, index) => {
              const color = CHART_COLORS[index % CHART_COLORS.length];
              return (
                <React.Fragment key={item.storage_id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, color: "#3b4350", minWidth: 0 }}>{item.storage_name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "#3b4350", textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatQuantities(item.quantities) || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#3b4350", textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatMoney(item.amount)}
                  </Typography>
                </React.Fragment>
              );
            })}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default WarehouseAccountingChart;
