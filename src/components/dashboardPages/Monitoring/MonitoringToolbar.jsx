import React from "react";
import { Box, Button, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Switch } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { MONITORING_STATUS_OPTIONS } from "./monitoringConstants";

const MonitoringToolbar = ({
  status,
  onStatusChange,
  equipmentGroups = [],
  equipmentGroupId,
  onEquipmentGroupChange,
  filterEnabled = false,
  filterToggleDisabled = false,
  onFilterEnabledChange,
  onOpenFilterInfo,
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

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="monitoring-equipment-group-label">Группа техники</InputLabel>
        <Select
          labelId="monitoring-equipment-group-label"
          value={equipmentGroupId ?? "all"}
          label="Группа техники"
          onChange={(e) => onEquipmentGroupChange(e.target.value === "all" ? null : e.target.value)}
        >
          <MenuItem value="all">Все</MenuItem>
          {equipmentGroups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        sx={{ ml: 0.5 }}
        control={
          <Switch
            size="small"
            color="success"
            checked={Boolean(filterEnabled)}
            disabled={filterToggleDisabled}
            onChange={(e) => onFilterEnabledChange(e.target.checked)}
          />
        }
        label="Автофильтрование строк"
      />
      <IconButton
        size="small"
        aria-label="Настройки автофильтра"
        onClick={onOpenFilterInfo}
        sx={{ color: "#2e7d32" }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
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
