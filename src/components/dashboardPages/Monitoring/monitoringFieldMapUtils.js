export const MONITORING_FIELD_MAP_VB_W = 100;
export const MONITORING_FIELD_MAP_VB_H = 64;
export const MONITORING_FIELD_MAP_PAD = 6;

/** Включить EPSG:3857 (Web Mercator). false — прежняя схема: ln/lt как X/Y без проекции. */
export const USE_WEB_MERCATOR_PROJECTION = true;

const WEB_MERCATOR_R = 6378137;

/** EPSG:4326 (lon/lat, degrees) → EPSG:3857 (Web Mercator, meters). */
export const wgs84ToWebMercator = (lon, lat) => {
  const x = WEB_MERCATOR_R * ((lon * Math.PI) / 180);
  const y = WEB_MERCATOR_R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return { x, y };
};

const toPlanar = (ln, lt) => (USE_WEB_MERCATOR_PROJECTION ? wgs84ToWebMercator(ln, lt) : { x: ln, y: lt });

export const parseFieldGeometryPoints = (geometry) => {
  const ptsRaw = geometry?.points;
  if (!Array.isArray(ptsRaw) || ptsRaw.length < 3) return [];
  return ptsRaw
    .slice()
    .sort((a, b) => (Number(a?.n) || 0) - (Number(b?.n) || 0))
    .map((p) => ({ ln: Number(p?.ln), lt: Number(p?.lt) }))
    .filter((p) => Number.isFinite(p.ln) && Number.isFinite(p.lt));
};

export const parseTrackPoints = (trackPoints) => {
  if (!Array.isArray(trackPoints) || trackPoints.length === 0) return [];
  return trackPoints
    .map((p) => ({ ln: Number(p?.lon), lt: Number(p?.lat) }))
    .filter((p) => Number.isFinite(p.ln) && Number.isFinite(p.lt));
};

export const createWgs84ToSvgTransform = (
  points,
  {
    vbW = MONITORING_FIELD_MAP_VB_W,
    vbH = MONITORING_FIELD_MAP_VB_H,
    pad = MONITORING_FIELD_MAP_PAD,
  } = {},
) => {
  if (!Array.isArray(points) || points.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    const { x, y } = toPlanar(p.ln, p.lt);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const w = maxX - minX;
  const h = maxY - minY;
  if (!Number.isFinite(w) || !Number.isFinite(h) || w === 0 || h === 0) return null;

  const scale = Math.min((vbW - pad * 2) / w, (vbH - pad * 2) / h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return (ln, lt) => {
    const { x, y } = toPlanar(ln, lt);
    return [(x - cx) * scale + vbW / 2, vbH / 2 - (y - cy) * scale];
  };
};

export const buildSvgPathD = (points, toSvg, { close = false } = {}) => {
  if (!Array.isArray(points) || points.length === 0 || !toSvg) return null;

  const [x0, y0] = toSvg(points[0].ln, points[0].lt);
  let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;

  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = toSvg(points[i].ln, points[i].lt);
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  if (close) d += " Z";
  return d;
};
