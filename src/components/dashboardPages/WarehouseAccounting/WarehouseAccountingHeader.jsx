import React from "react";
import { Box, Typography } from "@mui/material";

const WarehouseAccountingHeader = () => (
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
    >
      Склад-учёт
    </Typography>
    <Typography variant="body1" sx={{ color: "#333", fontSize: "14px", alignSelf: "center" }}>
      Учёт товарно-материальных ценностей (источник данных 1С)
    </Typography>
  </Box>
);

export default WarehouseAccountingHeader;
