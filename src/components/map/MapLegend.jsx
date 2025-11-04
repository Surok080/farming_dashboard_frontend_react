import React from 'react';
import { Box, Typography } from '@mui/material';

const MapLegend = ({ statistics, colorLayers, isSmallScreen }) => {
  if (!statistics || statistics.length === 0) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        right: "0px",
        bottom: "0px",
        width: "200px",
        height: isSmallScreen ? "auto" : "100%",
        maxHeight: isSmallScreen ? "500px" : "100%",
        minHeight: "100px",
        zIndex: "1000",
        background: "#ffffffed",
        borderRadius: "0px",
        overflowX: "hidden",
        overflowY: "scroll",
        padding: "10px",
      }}
    >
      <Typography>Легенда</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {statistics.map((item, key) => {
          if (key === 0) return null; // Пропускаем заголовок

          const color = colorLayers.find((layer) => layer.name === item[0])?.color ?? "red";

          return (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Box
                sx={{
                  width: "5px",
                  height: "30px",
                  background: color,
                  minWidth: "5px",
                  minHeight: '100%',
                  borderRadius: "2px",
                  opacity: 0.8,
                }}
              />
              <Typography align="left" variant="caption">
                {item[0]}
              </Typography>
              <Typography sx={{ marginLeft: 'auto' }} variant="caption">
                {item[1]}га
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MapLegend;

