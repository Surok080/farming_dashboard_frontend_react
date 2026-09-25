import { sanitizeDateInputYear } from "../monitoringUtils";

export const CAMPAIGN_MIN_DAYS = 2;
export const CAMPAIGN_MAX_DAYS = 30;

export const CAMPAIGN_STATUS_LABEL = {
  PLANNED: "Запланирована",
  ACTIVE: "Выполняется",
  FINISHED: "Завершена",
};

export const TRIGGER_FIELDS = [
  { key: "threshold_60", label: "60%" },
  { key: "threshold_80", label: "80%" },
  { key: "threshold_90", label: "90%" },
];

const EMPTY_TRIGGERS = {
  threshold_60: false,
  threshold_80: false,
  threshold_90: false,
};

export const emptyTriggerSettings = () => ({ ...EMPTY_TRIGGERS });

/** Локальная дата YYYY-MM-DD без сдвига часового пояса. */
export const toIsoDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const parseIsoDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const addDays = (isoDate, days) => {
  const date = parseIsoDate(isoDate);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const tomorrowIso = () => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
};

/** YYYY-MM-DD → DD-MM-YYYY для API кампаний. */
export const toCampaignApiDate = (isoDate) => {
  const date = parseIsoDate(isoDate);
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

/** DD-MM-YYYY или DD-MM-YYYY HH:MM:SS → DD.MM.YYYY */
export const formatCampaignDate = (value) => {
  if (!value) return "—";
  const match = /^(\d{2})-(\d{2})-(\d{4})/.exec(String(value).trim());
  if (!match) return String(value);
  return `${match[1]}.${match[2]}.${match[3]}`;
};

export const inclusiveDayCount = (startIso, stopIso) => {
  const start = parseIsoDate(startIso);
  const stop = parseIsoDate(stopIso);
  if (!start || !stop) return null;
  return Math.round((stop.getTime() - start.getTime()) / 86400000) + 1;
};

/**
 * Культура в справочнике кампаний отдельно не приходит.
 * Если название похоже на «1.1.1 Ячмень яровой 86.9 га», забираем среднюю часть.
 */
export const parseFieldCulture = (name) => {
  if (!name) return "";
  const withoutArea = String(name).replace(/\s+\d+(?:[.,]\d+)?\s*га\s*$/i, "").trim();
  const withoutCode = withoutArea.replace(/^\d+(?:\.\d+)+\s+/, "").trim();
  return withoutCode;
};

export const formatCampaignNumber = (value, precision = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
};

export const campaignPeriodError = (startIso, stopIso) => {
  const start = parseIsoDate(sanitizeDateInputYear(startIso));
  const stop = parseIsoDate(sanitizeDateInputYear(stopIso));
  if (!start || !stop) return "Укажите интервал кампании";

  const tomorrow = parseIsoDate(tomorrowIso());
  if (start < tomorrow) return "Кампанию можно создать только начиная со следующего дня";
  if (stop < start) return "Дата окончания не может быть раньше даты начала";

  const days = inclusiveDayCount(toIsoDate(start), toIsoDate(stop));
  if (days < CAMPAIGN_MIN_DAYS || days > CAMPAIGN_MAX_DAYS) {
    return `Длительность кампании должна быть от ${CAMPAIGN_MIN_DAYS} до ${CAMPAIGN_MAX_DAYS} дней`;
  }
  return "";
};
