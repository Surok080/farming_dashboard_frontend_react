import React from "react";
import { Box, Typography } from "@mui/material";

const toneSx = {
  canceled: { bgcolor: "rgba(211, 47, 47, 0.12)" },
  confirmed: { bgcolor: "rgba(46, 125, 50, 0.12)" },
  plain: { bgcolor: "#fff", border: "1px solid #e0e0e0" },
};

const MonitoringFilterLegend = ({ items = [] }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1, width: "100%" }}>
    {items.map((item) => (
      <Box
        key={item.id}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          px: 1.5,
          py: 1,
          borderRadius: "4px",
          ...toneSx[item.tone],
          ...(item.active ? { border: "2px solid #3f7d34" } : {}),
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 2 }}>
          <Typography sx={{ fontSize: 13, textAlign: "left" }}>{item.left}</Typography>
          <Typography sx={{ fontSize: 13, textAlign: "left" }}>{item.right}</Typography>
        </Box>
        {item.extra?.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            {item.extra.map((line, index) => (
              <Typography key={`${item.id}-${index}`} sx={{ fontSize: 13, textAlign: "left", display: "block" }}>
                {line}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    ))}
  </Box>
);

export default MonitoringFilterLegend;
