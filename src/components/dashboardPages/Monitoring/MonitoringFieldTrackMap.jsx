import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";

const VB_W = 100;
const VB_H = 64;
const PAD = 6;

const parseFieldPoints = (geometry) => {
  const ptsRaw = geometry?.points;
  if (!Array.isArray(ptsRaw) || ptsRaw.length < 3) return [];
  return ptsRaw
    .slice()
    .sort((a, b) => (Number(a?.n) || 0) - (Number(b?.n) || 0))
    .map((p) => ({ ln: Number(p?.ln), lt: Number(p?.lt) }))
    .filter((p) => Number.isFinite(p.ln) && Number.isFinite(p.lt));
};

const parseTrackPoints = (trackPoints) => {
  if (!Array.isArray(trackPoints) || trackPoints.length === 0) return [];
  return trackPoints
    .map((p) => ({ ln: Number(p?.lon), lt: Number(p?.lat) }))
    .filter((p) => Number.isFinite(p.ln) && Number.isFinite(p.lt));
};

const MonitoringFieldTrackMap = ({
  geometry,
  trackPoints,
  height = 220,
  fieldStroke = "#62A65D",
  fieldFill = "rgba(98, 166, 93, 0.14)",
  trackStroke = "#1565c0",
}) => {
  const { fieldPathD, trackPathD } = useMemo(() => {
    const fieldPts = parseFieldPoints(geometry);
    const trkPts = parseTrackPoints(trackPoints);

    const all = [...fieldPts, ...trkPts];
    if (all.length === 0) return { fieldPathD: null, trackPathD: null };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of all) {
      if (p.ln < minX) minX = p.ln;
      if (p.ln > maxX) maxX = p.ln;
      if (p.lt < minY) minY = p.lt;
      if (p.lt > maxY) maxY = p.lt;
    }

    const w = maxX - minX;
    const h = maxY - minY;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w === 0 || h === 0) {
      return { fieldPathD: null, trackPathD: null };
    }

    const scale = Math.min((VB_W - PAD * 2) / w, (VB_H - PAD * 2) / h);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const toSvg = (p) => {
      const x = (p.ln - cx) * scale + VB_W / 2;
      const y = VB_H / 2 - (p.lt - cy) * scale;
      return [x, y];
    };

    let fieldPathD = null;
    if (fieldPts.length >= 3) {
      const [x0, y0] = toSvg(fieldPts[0]);
      let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
      for (let i = 1; i < fieldPts.length; i += 1) {
        const [x, y] = toSvg(fieldPts[i]);
        d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      d += " Z";
      fieldPathD = d;
    }

    let trackPathD = null;
    if (trkPts.length >= 2) {
      const [tx0, ty0] = toSvg(trkPts[0]);
      let td = `M ${tx0.toFixed(2)} ${ty0.toFixed(2)}`;
      for (let i = 1; i < trkPts.length; i += 1) {
        const [x, y] = toSvg(trkPts[i]);
        td += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      trackPathD = td;
    } else if (trkPts.length === 1) {
      const [x, y] = toSvg(trkPts[0]);
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
        <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
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
