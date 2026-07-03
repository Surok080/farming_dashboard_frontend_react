import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  MONITORING_FIELD_MAP_VB_H,
  MONITORING_FIELD_MAP_VB_W,
  buildSvgPathD,
  createWgs84ToSvgTransform,
  parseFieldGeometryPoints,
  parseTrackPoints,
} from "./monitoringFieldMapUtils";

const MonitoringFieldTrackMap = ({
  geometry,
  trackPoints,
  height = 220,
  fieldStroke = "#62A65D",
  fieldFill = "rgba(98, 166, 93, 0.14)",
  trackStroke = "#1565c0",
}) => {
  const { fieldPathD, trackPathD } = useMemo(() => {
    const fieldPts = parseFieldGeometryPoints(geometry);
    const trkPts = parseTrackPoints(trackPoints);

    const all = [...fieldPts, ...trkPts];
    if (all.length === 0) return { fieldPathD: null, trackPathD: null };

    const toSvg = createWgs84ToSvgTransform(all);
    if (!toSvg) return { fieldPathD: null, trackPathD: null };

    const fieldPathD = fieldPts.length >= 3 ? buildSvgPathD(fieldPts, toSvg, { close: true }) : null;

    let trackPathD = null;
    if (trkPts.length >= 2) {
      trackPathD = buildSvgPathD(trkPts, toSvg);
    } else if (trkPts.length === 1) {
      const [x, y] = toSvg(trkPts[0].ln, trkPts[0].lt);
      trackPathD = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    }

    return { fieldPathD, trackPathD };
  }, [geometry, trackPoints]);

  if (!fieldPathD && !trackPathD) {
    return (
      <Box
        sx={{
          height,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 1,
          backgroundColor: "action.hover",
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          Нет геометрии поля и трека для отображения
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
        Поле и трек
      </Typography>
      <Box
        sx={{
          width: "100%",
          height,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor: "background.paper",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${MONITORING_FIELD_MAP_VB_W} ${MONITORING_FIELD_MAP_VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {fieldPathD ? (
            <path d={fieldPathD} fill={fieldFill} stroke={fieldStroke} strokeWidth="1.2" strokeLinejoin="round" />
          ) : null}
          {trackPathD ? (
            <path
              d={trackPathD}
              fill="none"
              stroke={trackStroke}
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </svg>
      </Box>
    </Box>
  );
};

export default MonitoringFieldTrackMap;
