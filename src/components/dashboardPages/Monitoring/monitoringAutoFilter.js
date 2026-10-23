import dayjs from "dayjs";
import {
  MONITORING_STATUS_CANCELED,
  MONITORING_STATUS_CONFIRMED,
  MONITORING_STATUS_PARTIALLY_CONFIRMED,
  MONITORING_STATUS_RAW,
  MONITORING_STATUS_READY_FOR_1C,
} from "./monitoringConstants";

export const DEFAULT_FILTER_SETTINGS = {
  enabled: false,
  min_agro_zone_percent: 1,
  min_visit_interval_seconds: 10,
  min_speed_kmh: 5,
  max_speed_kmh: 15,
};

export const DEFAULT_REPORT_SETTINGS = {
  enabled: false,
  send_time: "07:30",
};

export const COLUMN_SORT_BY = {
  period: "period_start",
  geozone: "field_name",
  device: "trailer_name",
  operation: "tech_operation_name",
  driver: "driver_name",
  productionHa: "area_worked",
  mileage: "mileage",
};

const FIELD_LABELS = {
  driver: "водитель",
  tech_operation: "техоперация",
  trailer: "прицеп",
};

const CHECK_LABELS = {
  agro_zone_percent: ["агрозона", "%"],
  visit_duration: ["время визита", "секунды"],
  speed: ["скорость", "км/ч"],
};

const GENERIC_LEGEND = [
  { id: 1, tone: "canceled", left: "Нет данных", right: "Не прошла пороги" },
  { id: 2, tone: "confirmed", left: "Все обязательные поля заполнены", right: "Прошла пороги, обязательные поля заполнены" },
  { id: 3, tone: "plain", left: "Не заполнены следующие обязательные поля:", right: "Прошла пороги, но чего-то не хватает" },
  { id: 4, tone: "plain", left: "Проверьте, заполнены ли обязательные поля", right: "Нет данных для расчёта порогов, пустая строка" },
];

export const monitoringStatusActions = (status) => ({
  canReturn: [MONITORING_STATUS_CONFIRMED, MONITORING_STATUS_CANCELED, MONITORING_STATUS_PARTIALLY_CONFIRMED].includes(status),
  canReject: [MONITORING_STATUS_RAW, MONITORING_STATUS_PARTIALLY_CONFIRMED].includes(status),
  canConfirm: [MONITORING_STATUS_RAW, MONITORING_STATUS_PARTIALLY_CONFIRMED].includes(status),
  canPublish1C: status === MONITORING_STATUS_CONFIRMED,
  showPartialLabel: status === MONITORING_STATUS_PARTIALLY_CONFIRMED,
});

export const formatSourceChangedAt = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY HH:mm") : null;
};

export const isSendTimeAllowed = (value) => {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return false;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes >= 5 * 60 && minutes <= 22 * 60;
};

const formatCheck = (key, check) => {
  const [label, unit] = CHECK_LABELS[key] ?? [key, ""];
  const valueText = check?.value == null ? "нет данных" : `${check.value}${unit ? ` ${unit}` : ""}`;
  const bounds = [];
  if (check?.min != null) bounds.push(`минимум ${check.min}`);
  if (check?.max != null) bounds.push(`максимум ${check.max}`);
  return bounds.length ? `${label}: ${valueText} при ${bounds.join(", ")}` : `${label}: ${valueText}`;
};

export const buildLegend = (row) => {
  const items = GENERIC_LEGEND.map((item) => ({ ...item, active: false, extra: [] }));
  const result = row?.auto_filter_result;
  if (!result) return items;
  const checks = result.checks ?? {};
  if (row.status === MONITORING_STATUS_CANCELED) {
    items[0].active = true;
    items[0].extra = Object.entries(checks)
      .filter(([, check]) => check?.passed === false && check?.value != null)
      .map(([key, check]) => formatCheck(key, check));
  } else if (row.status === MONITORING_STATUS_CONFIRMED || row.status === MONITORING_STATUS_READY_FOR_1C) {
    items[1].active = true;
  } else if (row.status === MONITORING_STATUS_PARTIALLY_CONFIRMED) {
    items[2].active = true;
    const names = (result.missing_fields ?? []).map((code) => FIELD_LABELS[code] ?? code);
    if (names.length) items[2].extra = [names.join(", ")];
  } else if (row.status === MONITORING_STATUS_RAW) {
    items[3].active = true;
    items[3].extra = Object.entries(checks)
      .filter(([, check]) => check?.value == null)
      .map(([key, check]) => formatCheck(key, check));
  }
  return items;
};
