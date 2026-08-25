import { OPENING_BALANCE_INPUT } from "./warehouseAccountingConstants";

export const sanitizeDateInputYear = (value) => {
  if (!value || typeof value !== "string") return "";
  const m = /^(\d+)(-\d{2}-\d{2})$/.exec(value.trim());
  if (!m) return value;
  const [, y, rest] = m;
  if (y.length <= 4) return value;
  return `${y.slice(0, 4)}${rest}`;
};

const toDateInputValue = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const getDefaultWarehouseInterval = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    from: OPENING_BALANCE_INPUT,
    to: toDateInputValue(today),
  };
};

/** UI YYYY-MM-DD → API DD-MM-YYYY */
export const toApiDate = (inputYmd) => {
  if (!inputYmd || typeof inputYmd !== "string") return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inputYmd.trim());
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
};

/** API DD-MM-YYYY → DD.MM.YYYY */
export const formatApiDateDisplay = (apiDate) => {
  if (!apiDate) return "";
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(apiDate).trim());
  if (!m) return String(apiDate);
  return `${m[1]}.${m[2]}.${m[3]}`;
};

const ruNumber = (value, minFrac, maxFrac) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("ru-RU", {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  });
};

export const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return `${ruNumber(value, 2, 2)} ₽`;
};

/** Сумма без символа валюты (заголовок уже говорит «руб»). */
export const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return ruNumber(value, 0, 2);
};

export const formatQuantity = (value, unit) => {
  if (value === null || value === undefined || value === "") return "—";
  const qty = ruNumber(value, 0, 3);
  return unit ? `${qty} ${unit}` : qty;
};

/** Приход/расход: +80 т / -35 л */
export const formatSignedQuantity = (value, unit, sign) => {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  const qty = ruNumber(Math.abs(num), 0, 3);
  const withUnit = unit ? `${qty} ${unit}` : qty;
  return `${sign}${withUnit}`;
};

export const formatQuantities = (list) => {
  if (!Array.isArray(list) || list.length === 0) return "";
  return list.map((item) => formatQuantity(item.quantity, item.unit)).join("  ");
};

export const hasMovement = (quantity, amount) =>
  Number(quantity) !== 0 || Number(amount) !== 0;

export const toggleId = (ids, id) => {
  const numId = Number(id);
  if (ids.includes(numId)) return ids.filter((item) => item !== numId);
  return [...ids, numId];
};

export const hasClientFilters = ({ storageIds, sectionIds, productIds }) =>
  (storageIds?.length ?? 0) > 0 || (sectionIds?.length ?? 0) > 0 || (productIds?.length ?? 0) > 0;

export const filterMovementRows = (rows, { storageIds, sectionIds, productIds }) => {
  const list = Array.isArray(rows) ? rows : [];
  const storageSet = new Set(storageIds ?? []);
  const sectionSet = new Set(sectionIds ?? []);
  const productSet = new Set(productIds ?? []);
  return list.filter((row) => {
    if (storageSet.size && !storageSet.has(row.storage_id)) return false;
    if (sectionSet.size && !sectionSet.has(row.section_id)) return false;
    if (productSet.size && !productSet.has(row.product_id)) return false;
    return true;
  });
};

export const aggregateStockFromMovement = (rows) => {
  const byStorage = new Map();
  for (const row of rows ?? []) {
    const current = byStorage.get(row.storage_id) ?? {
      storage_id: row.storage_id,
      storage_name: row.storage_name,
      amount: 0,
      quantities: new Map(),
    };
    current.amount += Number(row.closing_amount) || 0;
    const unit = row.unit ?? null;
    current.quantities.set(unit, (current.quantities.get(unit) || 0) + (Number(row.closing_quantity) || 0));
    byStorage.set(row.storage_id, current);
  }
  const storages = Array.from(byStorage.values())
    .map((item) => ({
      storage_id: item.storage_id,
      storage_name: item.storage_name,
      amount: item.amount,
      quantities: Array.from(item.quantities.entries()).map(([unit, quantity]) => ({ unit, quantity })),
    }))
    .filter((item) => item.amount || item.quantities.some((q) => q.quantity))
    .sort((a, b) => b.amount - a.amount);
  return {
    total_amount: storages.reduce((sum, item) => sum + item.amount, 0),
    storages,
  };
};
