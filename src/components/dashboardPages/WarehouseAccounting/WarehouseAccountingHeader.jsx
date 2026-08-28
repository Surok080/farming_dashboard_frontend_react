import React from "react";
import { Box, Typography } from "@mui/material";

const WarehouseAccountingHeader = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1.25,
      minWidth: 0,
      flex: 1,
      pb: 1.5,
      borderBottom: "1px solid #ebeff5",
    }}
  >

    <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
      <Typography
        sx={{
          background: "#67b55b",
          color: "#fff",
          px: 1.5,
          py: 0.8,
          borderRadius: "4px",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        Склад-Учет-2026
      </Typography>
      <Typography sx={{ color: "#525c69", fontSize: 13, lineHeight: 1.4 }}>
        Учёт товарно-материальных ценностей (источник данных 1С)
      </Typography>
    </Box>
    <Typography sx={{ color: "#3b4350", fontSize: 14, fontWeight: 500, textAlign: "left", width: "100%", alignSelf: "stretch" }}>
      Учёт затрат на растениеводство и движение готовой продукции на складе (по количеству и сумме)
    </Typography>
  </Box>
);

export default WarehouseAccountingHeader;
