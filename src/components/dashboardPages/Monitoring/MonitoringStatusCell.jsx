import React from "react";
import { Box, Checkbox } from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PublishedWithChangesOutlinedIcon from "@mui/icons-material/PublishedWithChangesOutlined";

const MonitoringStatusCell = ({ status, checked = false, onCheckedChange }) => {
  const common = { fontSize: "small" };

  switch (status) {
    case "CONFIRMED":
      icon = <CheckCircleOutlineOutlinedIcon sx={{ ...common, color: "#2e7d32" }} />;
      break;
    case "READY_FOR_1C":
      icon = <PublishedWithChangesOutlinedIcon sx={{ ...common, color: "#1565c0" }} />;
      break;
    case "CANCELED":
      icon = <CancelOutlinedIcon sx={{ ...common, color: "#d32f2f" }} />;
      break;
    case "RAW":
    default:
      icon = <HelpOutlineOutlinedIcon sx={{ ...common, color: "#757575" }} />;
      break;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Checkbox
        size="small"
        checked={checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        onClick={(event) => event.stopPropagation()}
        sx={{ p: 0.25 }}
      />
      {icon}
    </Box>
  );
};

export default MonitoringStatusCell;
