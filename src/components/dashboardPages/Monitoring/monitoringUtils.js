/**
 * Нормализует значение input type="date" (YYYY-MM-DD): год не больше 4 цифр.
 * В некоторых браузерах в сегменте года можно ввести лишние символы.
 */
export const sanitizeDateInputYear = (value) => {
  if (!value || typeof value !== "string") return "";
  const m = /^(\d+)(-\d{2}-\d{2})$/.exec(value.trim());
  if (!m) return value;
  const [, y, rest] = m;
  if (y.length <= 4) return value;
  return `${y.slice(0, 4)}${rest}`;
};

/** Значение для input type="date": YYYY-MM-DD */
export const toDateInputValue = (value) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** Вчера — сегодня (только дата, локальная зона). */
export const getDefaultMonitoringInterval = () => {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return {
    from: toDateInputValue(yesterday),
    to: toDateInputValue(today),
  };
};

export const parseDatetimeLocal = (value) => {
  if (!value) return null;
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const [, yyyy, mm, dd] = dateOnlyMatch;
    const localDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0, 0);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Для query: DD-MM-YYYY HH:MM:SS */
export const toApiDateTimeString = (datetimeLocalValue, options = {}) => {
  const { endOfDay = false } = options;
  const d = parseDatetimeLocal(datetimeLocalValue);
  if (!d) return "";
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(datetimeLocalValue)) {
    d.setHours(23, 59, 59, 0);
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
};

/** Отображение ISO периода в таблице */
export const formatPeriodStartDisplay = (isoString) => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return formatDateTime(d);
};

const formatDateOnly = (dt) => {
  if (!dt || Number.isNaN(dt.getTime())) return "";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const formatTimeHm = (dt) => {
  if (!dt || Number.isNaN(dt.getTime())) return "";
  const hh = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
};

/** Первая строка — дата, вторая — время в скобках (для вёрстки в 2 строки). */
export const getPeriodRangeDisplayParts = (periodStart, periodStop) => {
  const dStart = periodStart ? new Date(periodStart) : null;
  const dStop = periodStop ? new Date(periodStop) : null;
  const okStart = dStart && !Number.isNaN(dStart.getTime());
  const okStop = dStop && !Number.isNaN(dStop.getTime());

  if (!okStart && !okStop) {
    return { dateLine: null, timeLine: null };
  }

  if (okStart && okStop) {
    return {
      dateLine: formatDateOnly(dStart),
      timeLine: `(${formatTimeHm(dStart)}-${formatTimeHm(dStop)})`,
    };
  }

  if (okStart) {
    return {
      dateLine: formatDateOnly(dStart),
      timeLine: `(${formatTimeHm(dStart)})`,
    };
  }

  return {
    dateLine: formatDateOnly(dStop),
    timeLine: `(${formatTimeHm(dStop)})`,
  };
};

/** Одна строка: `01.01.1999 (14:30-17:00)` — для модалки и подписей */
export const formatPeriodRangeDisplay = (periodStart, periodStop) => {
  const { dateLine, timeLine } = getPeriodRangeDisplayParts(periodStart, periodStop);
  if (!dateLine && !timeLine) return "—";
  return [dateLine, timeLine].filter(Boolean).join(" ");
};

export const formatDateTime = (dt) => {
  if (!dt) return "";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
};

/**
 * Ограничение до 3 знаков после запятой.
 * Если у исходного значения больше 3 знаков после запятой, можно показывать tooltip с полным значением.
 */
export const formatNumberForDisplay = (value, precision = 3) => {
  if (value === null || value === undefined || value === "") {
    return { display: "—", full: "", hasTooltip: false };
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return { display: String(value), full: String(value), hasTooltip: false };
  }

  const full = String(value).trim();
  const normalized = full.replace(",", ".");
  const dotIdx = normalized.lastIndexOf(".");
  const fractional = dotIdx >= 0 ? normalized.slice(dotIdx + 1) : "";
  const hasTooltip = fractional.length > precision;
  const limited = num.toFixed(precision).replace(/\.?0+$/, "");

  return {
    display: hasTooltip ? limited : full,
    full,
    hasTooltip,
  };
};

