import React, { useMemo } from "react";
import { Box } from "@mui/material";
import {
  MONITORING_FIELD_MAP_VB_H,
  MONITORING_FIELD_MAP_VB_W,
  buildSvgPathD,
  createWgs84ToSvgTransform,
  parseFieldGeometryPoints,
} from "./monitoringFieldMapUtils";

const MonitoringFieldGeometryPreview = ({ geometry, size = 66, stroke = "#62A65D", fill = "rgba(98, 166, 93, 0.14)" }) => {
  const pathD = useMemo(() => {
    const pts = parseFieldGeometryPoints(geometry);
    if (pts.length < 3) return null;

    const toSvg = createWgs84ToSvgTransform(pts);
    if (!toSvg) return null;

    return buildSvgPathD(pts, toSvg, { close: true });
  }, [geometry]);

  if (!pathD) return null;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${MONITORING_FIELD_MAP_VB_W} ${MONITORING_FIELD_MAP_VB_H}`}
        aria-hidden="true"
        focusable="false"
      >
        <path d={pathD} fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    </Box>
  );
};

export default MonitoringFieldGeometryPreview;
