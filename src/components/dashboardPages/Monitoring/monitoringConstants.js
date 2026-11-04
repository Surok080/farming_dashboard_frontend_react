/** Коды статусов строк мониторинга (синхронно с бэкендом) */
export const MONITORING_STATUS_RAW = "RAW";
/** Акцент сырого статуса: кнопки, рамка модалки, превью поля */
export const MONITORING_STATUS_RAW_COLOR = "#FF9800";
export const MONITORING_STATUS_RAW_FILL_SOFT = "rgba(255, 152, 0, 0.14)";
export const MONITORING_STATUS_CONFIRMED = "CONFIRMED";
export const MONITORING_STATUS_PARTIALLY_CONFIRMED = "PARTIALLY_CONFIRMED";
export const MONITORING_STATUS_PARTIAL_COLOR = "#f9a825";
export const MONITORING_STATUS_PARTIAL_ROW_BG = "#fff4c2";
export const MONITORING_STATUS_CANCELED_ROW_BG = "rgba(211, 47, 47, 0.12)";
export const MONITORING_STATUS_CANCELED = "CANCELED";
export const MONITORING_STATUS_READY_FOR_1C = "READY_FOR_1C";

/** Статусы «отправлено / готово к отправке» — редактирование и смена статуса с фронта запрещены */
export const MONITORING_NON_EDITABLE_SENT_STATUSES = [
  MONITORING_STATUS_READY_FOR_1C,
  "SENT",
  "SENT_TO_1C",
];

/** Подписи для UI (подтверждение смены статуса и т.п.) */
export const MONITORING_STATUS_LABEL = {
  [MONITORING_STATUS_RAW]: "Сырая операция",
  [MONITORING_STATUS_CONFIRMED]: "Подтверждена",
  [MONITORING_STATUS_PARTIALLY_CONFIRMED]: "Подтверждена частично",
  [MONITORING_STATUS_CANCELED]: "Отклонена",
  [MONITORING_STATUS_READY_FOR_1C]: "Готова к отправке в 1С",
  SENT: "Отправлена в 1С",
  SENT_TO_1C: "Отправлена в 1С",
};

/** Максимум строк на странице в запросе /monitoring */
export const MONITORING_MAX_PAGE_SIZE = 100;

/** Значение по умолчанию при первом открытии */
export const MONITORING_DEFAULT_PAGE_SIZE = 10;

export const MONITORING_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const MONITORING_STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "RAW", label: "Сырая операция" },
  { value: "CONFIRMED", label: "Подтверждена" },
  { value: "PARTIALLY_CONFIRMED", label: "Подтверждена частично" },
  { value: "CANCELED", label: "Отклонена" },
  { value: "READY_FOR_1C", label: "Готова к отправке в 1С" },
];
