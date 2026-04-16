import React, { useMemo } from "react";
import { Box } from "@mui/material";

const MonitoringFieldGeometryPreview = ({ geometry, size = 66, stroke = "#62A65D", fill = "rgba(98, 166, 93, 0.14)" }) => {
  const pathD = useMemo(() => {
    const ptsRaw = geometry?.points;
    if (!Array.isArray(ptsRaw) || ptsRaw.length < 3) return null;

    const pts = ptsRaw
      .slice()
      .sort((a, b) => (Number(a?.n) || 0) - (Number(b?.n) || 0))
      .map((p) => ({ ln: Number(p?.ln), lt: Number(p?.lt) }))
      .filter((p) => Number.isFinite(p.ln) && Number.isFinite(p.lt));

    if (pts.length < 3) return null;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const p of pts) {
      if (p.ln < minX) minX = p.ln;
      if (p.ln > maxX) maxX = p.ln;
      if (p.lt < minY) minY = p.lt;
      if (p.lt > maxY) maxY = p.lt;
    }

    const w = maxX - minX;
    const h = maxY - minY;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w === 0 || h === 0) return null;

    const vbW = 100;
    const vbH = 64;
    const pad = 6;
    const scale = Math.min((vbW - pad * 2) / w, (vbH - pad * 2) / h);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const toSvg = (p) => {
      const x = (p.ln - cx) * scale + vbW / 2;
      const y = vbH / 2 - (p.lt - cy) * scale;
      return [x, y];
    };

    const [x0, y0] = toSvg(pts[0]);
    let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
    for (let i = 1; i < pts.length; i += 1) {
      const [x, y] = toSvg(pts[i]);
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += " Z";
    return d;
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
      <svg width={size} height={size} viewBox="0 0 100 64" aria-hidden="true" focusable="false">
        <path d={pathD} fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    </Box>
  );
};

export default MonitoringFieldGeometryPreview;
