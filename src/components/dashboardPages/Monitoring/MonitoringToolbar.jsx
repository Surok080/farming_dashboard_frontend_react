import React from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { MONITORING_SORT_BY_OPTIONS, MONITORING_SORT_ORDER_OPTIONS, MONITORING_STATUS_OPTIONS } from "./monitoringConstants";

const MonitoringToolbar = ({
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  statusCounts,
  total,
  hasSelection = false,
  onClearSelection,
}) => {
  const statusMetrics = MONITORING_STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => ({
    ...o,
    count: Number(statusCounts?.[o.value] ?? 0),
  }));

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="monitoring-status-label">Выберите статус</InputLabel>
        <Select
          labelId="monitoring-status-label"
          value={status}
          label="Выберите статус"
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {MONITORING_STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="monitoring-sort-by-label">Сортировка</InputLabel>
        <Select
          labelId="monitoring-sort-by-label"
          value={sortBy}
          label="Сортировка"
          onChange={(e) => onSortByChange(e.target.value)}
        >
          {MONITORING_SORT_BY_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="monitoring-sort-order-label">Порядок</InputLabel>
        <Select
          labelId="monitoring-sort-order-label"
          value={sortOrder}
          label="Порядок"
          onChange={(e) => onSortOrderChange(e.target.value)}
        >
          {MONITORING_SORT_ORDER_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          backgroundColor: "#4caf50",
          borderRadius: "4px",
          color: "#fff",
          px: 2,
          py: 0.75,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={onClearSelection}
          disabled={!hasSelection}
          sx={{
            marginRight: 'auto',
            borderColor: "rgba(255,255,255,0.8)",
            color: "#fff",
            textTransform: "none",
            "&:hover": {
              borderColor: "#fff",
              backgroundColor: "rgba(255,255,255,0.12)",
            },
            "&.Mui-disabled": {
              borderColor: "rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.6)",
            },
          }}
        >
          Очистить выбор
        </Button>
        <Box sx={{ fontWeight: 700 }}>Количество обработок: {Number(total ?? 0)}</Box>
        {statusMetrics.map((metric) => (
          <Box
            key={metric.value}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: "4px",
              px: 1,
              py: 0.25,
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {metric.label}: {metric.count}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MonitoringToolbar;
