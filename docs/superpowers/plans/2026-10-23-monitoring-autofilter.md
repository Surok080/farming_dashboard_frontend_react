# Мониторинг: автофильтр — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Показать пятый статус строк мониторинга, пороги и отчёт как две настройки, легенду причины под таблицей и сортировку кликом по заголовку колонки.

**Architecture:** Экран `MonitoringPages` остаётся владельцем запроса списка, выбора строк и диалогов. Чистые подписи, легенда и матрица кнопок живут в `monitoringAutoFilter.js`. Пороги уходят в `POST /monitoring/filter-settings`, отчёт — в `POST /notifications/auto-report/settings` без четырёх полей порогов. История статусов, поиск и клиентская сортировка страницы не делаются.

**Tech Stack:** React 18, Vite, MUI 5, dayjs, существующий `httpService`.

## Global Constraints

- Контракт: `sofit_backend_fastapi`, ветка `update_monitoring`.
- `PARTIALLY_CONFIRMED` нельзя отправить в `POST /monitoring/{id}/status`. Кнопки этого статуса нет.
- Подписи полей: `driver` — водитель, `tech_operation` — техоперация, `trailer` — прицеп.
- Проверки: `agro_zone_percent` — агрозона, %, `visit_duration` — время визита, секунды, `speed` — скорость, км/ч. `value: null` в список провалов не попадает.
- Салатовый значок `#7aa93c`, фон частичной строки `rgba(122, 169, 60, 0.18)`, фон отклонённой `rgba(211, 47, 47, 0.12)`. Сырой статус остаётся оранжевым, без заливки строки.
- Время отчёта только `05:00`–`22:00`. Значения по умолчанию при 404: фильтр выключен, агрозона `1`, интервал `10` секунд, скорость `5`–`15`, отчёт выключен, время `07:30`.
- Дата пометки SMSR: `DD.MM.YYYY HH:mm`.
- Кнопка «Скачать за вчера» только при `userInfo.role === "super_admin"`.
- Клик «Опубликовать в 1с» в карточке и в шапке по-прежнему открывает `MonitoringPublish1CUnavailableDialog`. Реальный `POST` в `READY_FOR_1C` из карточки не включать. Кнопка активна только у `CONFIRMED`.
- Объединение по-прежнему только из строк `CONFIRMED`. В MAX добавляется `PARTIALLY_CONFIRMED` рядом с `CONFIRMED` и `READY_FOR_1C`.
- Опрос трека: каждые 2 секунды, пока диалог открыт и `is_track_loading` истинно. Ошибка останавливает опрос и один раз показывает snackbar.
- `git commit` не выполнять. Коммит только после отдельного «да» пользователя. `docs/superpowers/**` не коммитить.
- Тестового раннера нет. Проверка задачи — указанные ручные шаги. В конце `npm run build`.

---

## Файлы

| Файл | Ответственность |
|---|---|
| Создать `src/components/dashboardPages/Monitoring/monitoringAutoFilter.js` | Подписи, легенда, матрица кнопок, значения по умолчанию, карта сортировки |
| Создать `src/components/dashboardPages/Monitoring/MonitoringFilterLegend.jsx` | Четыре плашки |
| Править `src/api/monitoring.js` | Фильтр настроек |
| Править `src/api/notifications.js` | Комментарий: тело отчёта без порогов |
| Править `monitoringConstants.js` | Пятый статус |
| Править `MonitoringStatusCell.jsx`, `MonitoringStatusActions.jsx`, `MonitoringRowDialog.jsx` | Цвет и кнопки |
| Править `MonitoringTable.jsx` | Фон, заголовок группы, сортировка, пометка SMSR |
| Править `MonitoringToolbar.jsx` | Группа, тумблер, без списков сортировки |
| Править `MonitoringPages.jsx` | Параметры запроса, легенда, MAX, опрос трека |
| Править `MonitoringRowDialogContent.jsx` | Текст «Трек загружается» |
| Править `MonitoringSettingsDialog.jsx` | Две колонки и два адреса |

### Task 1: Контракт и чистые правила

**Files:**
- Create: `src/components/dashboardPages/Monitoring/monitoringAutoFilter.js`
- Modify: `src/api/monitoring.js`
- Modify: `src/api/notifications.js`
- Modify: `src/components/dashboardPages/Monitoring/monitoringConstants.js`

**Interfaces:**
- Consumes: нет
- Produces:
  - `MONITORING_STATUS_PARTIALLY_CONFIRMED = "PARTIALLY_CONFIRMED"`
  - `getMonitoringFilterSettings()`, `postMonitoringFilterSettings(payload)`
  - `DEFAULT_FILTER_SETTINGS`, `DEFAULT_REPORT_SETTINGS`
  - `COLUMN_SORT_BY` — объект `columnKey -> sort_by | null`
  - `monitoringStatusActions(status) -> { canReturn, canReject, canConfirm, canPublish1C, showPartialLabel }`
  - `buildLegend(row | null) -> Array<{ id, tone, left, right, active, extra }>`
  - `formatSourceChangedAt(value) -> string | null`
  - `isSendTimeAllowed(value) -> boolean` для строки `HH:mm`

- [ ] **Step 1: Добавить статус в константы**

В `monitoringConstants.js` после `MONITORING_STATUS_CONFIRMED`:

```js
export const MONITORING_STATUS_PARTIALLY_CONFIRMED = "PARTIALLY_CONFIRMED";
export const MONITORING_STATUS_PARTIAL_COLOR = "#7aa93c";
export const MONITORING_STATUS_PARTIAL_ROW_BG = "rgba(122, 169, 60, 0.18)";
export const MONITORING_STATUS_CANCELED_ROW_BG = "rgba(211, 47, 47, 0.12)";
```

В `MONITORING_STATUS_LABEL` добавить ключ `[MONITORING_STATUS_PARTIALLY_CONFIRMED]: "Подтвержден частично"`.

В `MONITORING_STATUS_OPTIONS` после подтверждённой вставить `{ value: "PARTIALLY_CONFIRMED", label: "Подтвержден частично" }`.

`MONITORING_SORT_BY_OPTIONS` и `MONITORING_SORT_ORDER_OPTIONS` удалить вместе с импортами, когда тулбар перестанет их брать (Task 4). До Task 4 константы не удалять.

- [ ] **Step 2: Ручки фильтра**

В `src/api/monitoring.js`:

```js
export function getMonitoringFilterSettings() {
  return httpService.get("/monitoring/filter-settings");
}

export function postMonitoringFilterSettings(payload) {
  return httpService.post("/monitoring/filter-settings", payload);
}
```

В `src/api/notifications.js` у `postAutoReportSettings` заменить комментарий на: тело только `{ enabled, send_time }`. Пороги не передавать.

- [ ] **Step 3: Создать `monitoringAutoFilter.js`**

```js
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
  visit_duration: ["время визита", "с"],
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
      .filter(([, check]) => check?.passed === false)
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
```

- [ ] **Step 4: Проверка**

Открыть файл и убедиться, что `buildLegend(null)` возвращает четыре объекта с `active: false` и пустым `extra`. `isSendTimeAllowed("04:59")` ложно, `isSendTimeAllowed("05:00")` и `isSendTimeAllowed("22:00")` истинны. Сборку пока не гонять.

### Task 2: Значок, кнопки и рамка

**Files:**
- Modify: `src/components/dashboardPages/Monitoring/MonitoringStatusCell.jsx`
- Modify: `src/components/dashboardPages/Monitoring/MonitoringStatusActions.jsx`
- Modify: `src/components/dashboardPages/Monitoring/MonitoringRowDialog.jsx`
- Modify: `src/components/dashboardPages/Monitoring/MonitoringPages.jsx` (только флаги кнопок и обработчики статуса)

**Interfaces:**
- Consumes: `monitoringStatusActions`, `MONITORING_STATUS_PARTIALLY_CONFIRMED`, `MONITORING_STATUS_PARTIAL_COLOR`
- Produces: карточка не даёт нажать частичный статус; «Отклоненный» недоступен из `CONFIRMED`

- [ ] **Step 1: Салатовый значок**

В `MonitoringStatusCell.jsx` добавить `case "PARTIALLY_CONFIRMED"` перед `CONFIRMED`: `CheckCircleOutlineOutlinedIcon` с `color: "#7aa93c"`.

- [ ] **Step 2: Подпись частичного статуса**

В `MonitoringStatusActions.jsx` принять проп `showPartialLabel`. Когда он истинный, над кнопками вывести `Typography` с текстом «Подтвержден частично» и цветом `#7aa93c`. В `statusLabelMap` добавить `PARTIALLY_CONFIRMED: "Подтвержден частично"`.

- [ ] **Step 3: Рамка диалога**

В `getDialogBorderColor` первой веткой: если статус `PARTIALLY_CONFIRMED`, вернуть `#7aa93c`. Пробросить `showPartialLabel` в `MonitoringStatusActions`.

- [ ] **Step 4: Флаги в `MonitoringPages`**

Заменить вычисление `canConfirm`, `canReject`, `canReturn`, `canPublish1C` у `MonitoringRowDialog` на результат `monitoringStatusActions(dialogData?.row?.status)`.

`handleDialogConfirm`: разрешить статусы `RAW` и `PARTIALLY_CONFIRMED`. Проверку заполненных полей оставить: пустые поля и несохранённая форма по-прежнему останавливают подтверждение своим snackbar до запроса. Если запрос всё же вернул 400, уже существующий `getErrorMessage` показывает `detail`.

`handleDialogReject`: разрешить только `RAW` и `PARTIALLY_CONFIRMED`. Убрать `CONFIRMED` из этого списка.

`handleDialogReturn`: разрешить `CONFIRMED`, `CANCELED` и `PARTIALLY_CONFIRMED`.

`handleDialogPublish1C` не менять: он открывает диалог недоступности. Кнопка просто выключена, когда `canPublish1C` ложен.

- [ ] **Step 5: Проверка**

В карточке сырой строки активны подтверждение и отклонение. У частично подтверждённой видна салатовая подпись, активны сырой, отклонение и подтверждение, публикация в 1С серая. У подтверждённой отклонение серое. У отклонённой активен только сырой.

### Task 3: Таблица

**Files:**
- Modify: `src/components/dashboardPages/Monitoring/MonitoringTable.jsx`
- `monitoringColumns.js` не менять: ключи колонок уже совпадают с `COLUMN_SORT_BY`

**Interfaces:**
- Consumes: `COLUMN_SORT_BY`, `formatSourceChangedAt`, цвета строки из констант
- Produces: пропы `sortBy`, `sortOrder`, `onColumnSort(sortByValue)`, `groupTitle`

- [ ] **Step 1: Заголовок группы и сортируемые шапки**

`MonitoringTable` принимает `sortBy`, `sortOrder`, `onColumnSort`, `groupTitle`.

Если `groupTitle` непустой, перед `TableHead` показать одну строку на всю ширину: текст `groupTitle`, фон `#eef6ea`, жирный.

В `TableHead` для колонки, у которой `COLUMN_SORT_BY[c.key]` задан, ячейка — `ButtonBase` или кликабельный `Box`. Клик вызывает `onColumnSort(COLUMN_SORT_BY[c.key])` и `event.stopPropagation` не нужен: это шапка. Если `sortBy` совпал с этим значением, после подписи показать `▲` при `asc` и `▼` при `desc`. Колонки без ключа в `COLUMN_SORT_BY` остаются текстом.

- [ ] **Step 2: Фон строки и пометка SMSR**

У `TableRow` фон: `PARTIALLY_CONFIRMED` — `MONITORING_STATUS_PARTIAL_ROW_BG`, `CANCELED` — `MONITORING_STATUS_CANCELED_ROW_BG`. Hover оставить. В ячейке периода под датой, если `formatSourceChangedAt(row.source_changed_at)` не `null`, строка мелким текстом: `Данные в SMSR изменились {дата}`.

- [ ] **Step 3: Проверка**

Клик по «Пробег, км» должен быть предусмотрен пропом. «Статус», «Площадь га», «Сельхоз машина», «Ширина, м» без обработчика. Пока родитель не передан, таблица не должна падать: `onColumnSort` опциональный.

### Task 4: Тулбар и запрос списка

**Files:**
- Modify: `src/components/dashboardPages/Monitoring/MonitoringToolbar.jsx`
- Modify: `src/components/dashboardPages/Monitoring/MonitoringPages.jsx`

**Interfaces:**
- Consumes: `getMonitoringFilterSettings`, `postMonitoringFilterSettings`, `DEFAULT_FILTER_SETTINGS`, `COLUMN_SORT_BY`
- Produces: `equipment_group_id` в запросе, тумблер `enabled` на странице, состояние сортировки от колонок

- [ ] **Step 1: Убрать списки сортировки из тулбара**

Удалить селекты «Сортировка» и «Порядок» и пропы `sortBy`, `onSortByChange`, `sortOrder`, `onSortOrderChange`. Добавить пропы `equipmentGroups`, `equipmentGroupId`, `onEquipmentGroupChange`, `filterEnabled`, `filterToggleDisabled`, `onFilterEnabledChange`, `onOpenFilterInfo`.

Селект «Группа техники»: значение `equipmentGroupId ?? "all"`, первый пункт «Все», далее `equipmentGroups`. Рядом `FormControlLabel` с `Switch` «Автофильтрование строк» и `IconButton` с `InfoOutlined`, клик вызывает `onOpenFilterInfo`. Счётчик статуса уже рисуется из `MONITORING_STATUS_OPTIONS`, пятый пункт появится сам после Task 1.

- [ ] **Step 2: Состояние страницы**

В `MonitoringPages`:

```js
const [equipmentGroupId, setEquipmentGroupId] = useState(null);
const [equipmentGroups, setEquipmentGroups] = useState([]);
const [filterSettings, setFilterSettings] = useState(DEFAULT_FILTER_SETTINGS);
const [filterToggleLoading, setFilterToggleLoading] = useState(false);
```

В `fetchMonitoringData` добавить `if (equipmentGroupId != null) params.equipment_group_id = equipmentGroupId`. Из ответа писать `setEquipmentGroups(Array.isArray(data?.equipment_groups) ? data.equipment_groups : [])`. Если выбранный id больше не входит в новый список, `setEquipmentGroupId(null)`.

`useEffect` на `[status, sortBy, sortOrder]` дополнить `equipmentGroupId`, чтобы смена группы сбрасывала страницу на первую и перезапрашивала список после первого «Выполнить».

При монтировании прочитать `getMonitoringFilterSettings`. Статус 404 заменяет состояние на `DEFAULT_FILTER_SETTINGS` без snackbar. Другая ошибка показывает `detail`.

`handleColumnSort(nextSortBy)`: если `sortBy === nextSortBy`, переключить `sortOrder` между `asc` и `desc`, иначе `setSortBy(nextSortBy)` и `setSortOrder("asc")`.

`handleFilterEnabledChange`: `postMonitoringFilterSettings({ ...filterSettings, enabled: next })`. Успех пишет ответ в `filterSettings` без `updated_at`. Диалог получает проп `onFilterSaved`. После успешного «Сохранить» страница кладёт в `filterSettings` тело, которое ушло в фильтр, чтобы следующий тумблер на списке не затёр новые пороги старыми. Отчёт при открытии диалога читается заново.

В `selectedMaxSendRows` массив статусов заменить на `CONFIRMED`, `PARTIALLY_CONFIRMED`, `READY_FOR_1C`. Текст предупреждения: «Для отправки в MAX выберите подтверждённые, частично подтверждённые или опубликованные в 1С строки». `canMerge` и фильтр `selectedConfirmedRows` не расширять.

`onPublish1C` шапки не подключать к `executePublish1C`. Кнопку шапки дизейблить, когда выбранные строки не все `CONFIRMED` (`publishDisabled` уже есть: добавить `|| !canPublish1C`). Клик при доступной кнопке по-прежнему открывает диалог недоступности.

Передать в таблицу `sortBy`, `sortOrder`, `onColumnSort={handleColumnSort}`, `groupTitle` — имя группы при `equipmentGroupId != null`, иначе `""`.

- [ ] **Step 3: Проверка**

После «Выполнить» смена группы добавляет `equipment_group_id` и при непустом выборе показывает одну строку-заголовок. «Все» заголовок убирает. Клик по «Водитель» ставит `sort_by=driver_name`, повторный клик ставит `desc`. Списки «Сортировка» и «Порядок» на экране отсутствуют. Частично подтверждённая строка входит в выбор для MAX и не входит в объединение.

### Task 5: Легенда

**Files:**
- Create: `src/components/dashboardPages/Monitoring/MonitoringFilterLegend.jsx`
- Modify: `src/components/dashboardPages/Monitoring/MonitoringPages.jsx`

**Interfaces:**
- Consumes: `buildLegend(row)`
- Produces: блок под `MonitoringTable`

- [ ] **Step 1: Компонент**

`MonitoringFilterLegend` принимает `items` из `buildLegend`. Каждый элемент — полоса на всю ширину, две колонки текста и под ними `extra`, каждый пункт с новой строки. `tone: "canceled"` — фон `rgba(211, 47, 47, 0.12)`. `tone: "confirmed"` — фон `rgba(46, 125, 50, 0.12)`. `tone: "plain"` — белый фон и рамка `#e0e0e0`. У `active` рамка `2px solid #3f7d34`.

- [ ] **Step 2: Загрузка одной строки**

Состояние `legendRow`. Эффект по `selectedRowIds`:

- длина не равна 1: `setLegendRow(null)` и выйти;
- иначе `getMonitoringById(selectedRowIds[0])`, в состояние класть `data.row`;
- перед записью проверять, что id всё ещё единственный выбранный;
- ошибка: `setLegendRow(null)` и snackbar с `detail`.

Под таблицей: `<MonitoringFilterLegend items={buildLegend(selectedRowIds.length === 1 ? legendRow : null)} />`. Пока запрос идёт, `legendRow` ещё старый или `null`: при смене id сначала обнулять `legendRow`, чтобы не показать причину предыдущей строки.

- [ ] **Step 3: Проверка**

Без отметки и при двух отметках четыре общие плашки, ни одна не активна. Одна отметка со снимком `CANCELED` активирует первую плашку и пишет проваленные проверки. Снимок `null` оставляет общие тексты.

### Task 6: Карточка — трек и пометка SMSR

**Files:**
- Modify: `src/components/dashboardPages/Monitoring/MonitoringRowDialogContent.jsx`
- Modify: `src/components/dashboardPages/Monitoring/MonitoringRowDialog.jsx`
- Modify: `src/components/dashboardPages/Monitoring/MonitoringPages.jsx`

**Interfaces:**
- Consumes: `formatSourceChangedAt`, уже существующий `getMonitoringById`
- Produces: нет новых экспортов

- [ ] **Step 1: Пометка в шапке**

В `MonitoringRowDialog` под подзаголовком, если `formatSourceChangedAt(row.source_changed_at)` не `null`, текст «Данные в SMSR изменились {дата}».

- [ ] **Step 2: Трек**

В `MonitoringRowDialogContent` если `row.is_track_loading`, вместо `MonitoringFieldTrackMap` блок высотой как карта с текстом «Трек загружается».

- [ ] **Step 3: Опрос**

В `MonitoringPages` эффект: диалог открыт, у строки `is_track_loading` и есть `id`. `setInterval` 2000 мс вызывает `getMonitoringById`. В `setDialogData` подменить только пришедшие `track_points`, `is_track_loading` и `source_changed_at`, не затирая `driver_id`, `tech_operation_id`, `trailer_id`, `trailer_width` текущей формы. Когда флаг стал ложным, интервал очищается. `catch` очищает интервал и один раз показывает snackbar. Cleanup эффекта очищает интервал при закрытии диалога и при смене id.

`handleDialogSave` уже перезапрашивает строку. Отдельную логику «если поля заполнены, поставить CONFIRMED» не писать: это делает бэкенд, а повторный GET обновляет статус.

- [ ] **Step 4: Проверка**

Открытая карточка с `is_track_loading: true` показывает текст и повторяет запрос. Закрытие диалога новые запросы не шлёт. Несохранённый водитель в селекте после тика опроса остаётся выбранным.

### Task 7: Диалог настроек

**Files:**
- Modify: `src/components/dashboardPages/Monitoring/MonitoringSettingsDialog.jsx`

**Interfaces:**
- Consumes: `getMonitoringFilterSettings`, `postMonitoringFilterSettings`, `getAutoReportSettings`, `postAutoReportSettings`, `DEFAULT_FILTER_SETTINGS`, `DEFAULT_REPORT_SETTINGS`, `isSendTimeAllowed`, `formatSecondsAsTime`, `parseTimeToSeconds`, `getMonitoringAutoDownloadStatus`, `toggleMonitoringAutoDownload`, `postMonitoringDownloadYesterday`, проп `onFilterSaved(filterPayload)`
- Produces: вызов `onFilterSaved` после успешного сохранения фильтра

- [ ] **Step 1: Загрузка при открытии**

При `open` параллельно читать фильтр и отчёт. Ответ 404 на любую из ручек подставляет её `DEFAULT_*` без snackbar. Другие ошибки — snackbar с `detail`. Локальные копии не пишутся на сервер до «Сохранить». «Закрыть» только вызывает `onClose`.

Автоскачивание по-прежнему грузится через `getMonitoringAutoDownloadStatus` и переключается сразу через `toggleMonitoringAutoDownload`. В «Сохранить» оно не входит.

Кнопку «Скачать за вчера» рендерить только если `useSelector((state) => state.user?.userInfo?.role) === "super_admin"`.

- [ ] **Step 2: Вёрстка**

`Dialog` `maxWidth="md"`. Заголовок оставить «Настройки мониторинга». Контент — сетка из двух колонок, на узком экране одна колонка.

Слева сверху `Alert` severity `info` с текущим текстом ответственности. Карточка «Автозагрузка данных»: текущие тексты, тумблер, кнопка скачивания для суперадмина. Карточка «Автоматизированные уведомления»: подпись «Ежедневная отправка в MAX строк, которые разметил автофильтр», тумблер, поле времени `type="time"` со значением `send_time`. Тумблер отчёта `disabled`, когда локальный фильтр `enabled === false`. Под ним текст: «Чтобы отчёт уходил в MAX, подключите бота в Настройки → Уведомления». Без `navigate` и без смены вкладки.

Справа карточка «Автофильтрование строк»: тумблер и три поля текущего диалога (процент, `ЧЧ:ММ:СС`, скорость от/до). Поля `disabled`, когда тумблер фильтра выключен. Поля больше не сохраняются на `blur`.

Кнопки справа внизу: «Сохранить» (`#62A65D`) и «Закрыть».

- [ ] **Step 3: Сохранение**

Перед запросом:

- процент привести к числу от 0 до 100, иначе подпись под полем и `return`;
- интервал через `parseTimeToSeconds`, `null` — подпись «Укажите время в формате ЧЧ:ММ:СС» и `return`;
- если `min_speed_kmh > max_speed_kmh`, подпись под скоростью и `return`;
- если `!isSendTimeAllowed(send_time)`, подпись «Время отправки должно быть с 05:00 до 22:00» и `return`.

Затем `postMonitoringFilterSettings` с пятью полями, без `updated_at`. Если в этой форме `enabled` фильтра ложен, в отчёт отправить `enabled: false` и введённое `send_time`. Иначе отправить введённые `enabled` и `send_time`. Ответ 409 показать текстом `detail` и не закрывать диалог. Успех обоих запросов: snackbar «Настройки сохранены», обновить локальное состояние из ответов, вызвать `onFilterSaved` с пятью полями фильтра, диалог оставить открытым.

- [ ] **Step 4: Проверка**

404 на обе ручки показывает 1 %, `00:00:10`, скорость 5 и 15, время `07:30`, оба тумблера выключены. Время `04:30` не вызывает `postAutoReportSettings`. Выключенный фильтр не даёт включить тумблер отчёта. У пользователя с ролью не `super_admin` кнопки скачивания за вчера нет.

### Task 8: Сборка

**Files:** нет новых

- [ ] **Step 1: Удалить неиспользуемые константы сортировки**

Если `MONITORING_SORT_BY_OPTIONS` и `MONITORING_SORT_ORDER_OPTIONS` больше нигде не импортируются, удалить их из `monitoringConstants.js`.

- [ ] **Step 2: Сборка**

Run: `npm run build`  
Expected: команда завершается с кодом 0.

- [ ] **Step 3: Не коммитить**

`git status` можно посмотреть. `git add` и `git commit` не запускать.
