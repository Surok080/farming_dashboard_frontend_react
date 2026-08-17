import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { formatMoney, formatQuantities } from "./warehouseAccountingUtils";

const WarehouseAccountingSectionCards = ({ items = [], selectedIds = [], onToggle }) => {
  if (!items.length) return null;
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
      {items.map((item) => {
        const selected = selectedIds.includes(item.section_id);
        return (
          <Paper
            key={item.section_id}
            onClick={() => onToggle(item.section_id)}
            variant="outlined"
            sx={{
              p: 1.5,
              minWidth: 160,
              cursor: "pointer",
              borderColor: selected ? "#62A65D" : "#e0e0e0",
              backgroundColor: selected ? "rgba(98, 166, 93, 0.12)" : "#fff",
              boxShadow: "none",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>{item.section_name}</Typography>
            <Typography sx={{ fontSize: 12, color: "#555", mb: 0.5 }}>
              {formatQuantities(item.closing_quantities)}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{formatMoney(item.closing_amount)}</Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

export default WarehouseAccountingSectionCards;
