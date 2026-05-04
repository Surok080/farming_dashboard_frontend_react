/** Коды статусов строк мониторинга (синхронно с бэкендом) */
export const MONITORING_STATUS_RAW = "RAW";
/** Акцент сырого статуса: кнопки, рамка модалки, превью поля */
export const MONITORING_STATUS_RAW_COLOR = "#FF9800";
export const MONITORING_STATUS_RAW_FILL_SOFT = "rgba(255, 152, 0, 0.14)";
export const MONITORING_STATUS_CONFIRMED = "CONFIRMED";
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
  [MONITORING_STATUS_RAW]: "Сырой",
  [MONITORING_STATUS_CONFIRMED]: "Подтверждённый",
  [MONITORING_STATUS_CANCELED]: "Отклонённый",
  [MONITORING_STATUS_READY_FOR_1C]: "Опубликованно в 1с",
  SENT: "Опубликованно в 1с",
  SENT_TO_1C: "Опубликованно в 1с",
};

/** Максимум строк на странице в запросе /monitoring */
export const MONITORING_MAX_PAGE_SIZE = 100;

/** Значение по умолчанию при первом открытии */
export const MONITORING_DEFAULT_PAGE_SIZE = 10;

export const MONITORING_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const MONITORING_STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "RAW", label: "Сырая строка" },
  { value: "CONFIRMED", label: "Подтверждённая" },
  { value: "CANCELED", label: "Отменённая" },
  { value: "READY_FOR_1C", label: "Готово к отправке в 1С" },
];

export const MONITORING_SORT_BY_OPTIONS = [
  { value: "period_start", label: "Период" },
  { value: "field_name", label: "Поле" },
  { value: "trailer_name", label: "Прицепное" },
  { value: "tech_operation_name", label: "Тех.операция" },
  { value: "area_worked", label: "Выработке, Га" },
  { value: "driver_name", label: "Водитель" },
];

export const MONITORING_SORT_ORDER_OPTIONS = [
  { value: "asc", label: "По возрастанию" },
  { value: "desc", label: "По убыванию" },
];
