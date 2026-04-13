import React from "react";
import { Box, Button, Typography } from "@mui/material";
import PublishedWithChangesOutlinedIcon from "@mui/icons-material/PublishedWithChangesOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const MonitoringHeader = ({
  year,
  onPublish1C,
  publishDisabled = false,
  onMerge,
  mergeDisabled = false,
  mergeLoading = false,
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
    <Box display="flex" gap={2} mb={0} flexWrap="wrap" alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          background: "#62A65D",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          fontWeight: "bold",
          fontSize: "16px",
        }}
        variant="body1"
        textAlign="left"
      >
        Мониторинг-{year}
      </Typography>
      <Typography
        variant="body1"
        textAlign="left"
        sx={{
          color: "#333",
          fontSize: "14px",
          alignSelf: "center",
        }}
      >
        Спутниковый мониторинг сельскохозяйственной техники (источники данных Фот Монитор)
      </Typography>
    </Box>
    <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-start", flexWrap: "wrap" }}>
      <Button
        onClick={onMerge}
        disabled={mergeDisabled || mergeLoading}
        variant="outlined"
        sx={{
          borderColor: "#4caf50",
          color: "#4caf50",
          textTransform: "uppercase",
          fontWeight: 600,
          boxShadow: "none",
        }}
        startIcon={<SearchOutlinedIcon fontSize="small" />}
      >
        {mergeLoading ? "ОБЪЕДИНЕНИЕ..." : "ОБЪЕДИНИТЬ"}
      </Button>
      <Button
        onClick={onPublish1C}
        disabled={publishDisabled}
        variant="contained"
        sx={{
          backgroundColor: "#1565c0",
          color: "#fff",
          boxShadow: "none",
          "&:hover": { backgroundColor: "#0d47a1", boxShadow: "none" },
          textTransform: "none",
        }}
        startIcon={<PublishedWithChangesOutlinedIcon />}
      >
        ОПУБЛИКОВАТЬ 1С
      </Button>
    </Box>
  </Box>
);

export default MonitoringHeader;
