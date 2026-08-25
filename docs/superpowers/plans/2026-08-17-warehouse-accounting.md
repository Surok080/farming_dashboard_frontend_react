# Склад-учёт Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить вкладку «Склад-учёт» с таблицей движения ТМЦ, карточками разделов, графиком остатков по складам и модалкой документов.

**Architecture:** Страница-контейнер грузит за период `dictionaries`, `movement`, `sections_summary`, `stock_by_storages`. Склады, разделы и наименования фильтруют `movement.rows` на клиенте. Карточки всегда из `sections_summary`. График без фильтров — из `stock_by_storages`, с фильтрами — агрегация кон. остатка по складу из отфильтрованных строк. Вкладка видна только с правом `warehouse_accounting`.

**Tech Stack:** React 18, MUI 5, axios `httpService`, `react-google-charts` PieChart, notistack.

## Global Constraints

- Автотесты не добавлять (spec, в репозитории их нет). Проверка задачи — ручной сценарий в конце задачи.
- Новых npm-зависимостей не ставить.
- Даты в UI: `YYYY-MM-DD`. В query API: `DD-MM-YYYY`. Конвертация только в `warehouseAccountingUtils.js`.
- Пустой массив выбранных id = «все».
- Кнопки «Настройки» и «Выполнить» на месте и `disabled`.
- Бэкенд не менять. В `/movement` не передавать `storage_id` / `product_id` / `section_id`.
- Год из шапки приложения страница не использует.
- Копирайт и подписи — на русском, как в spec.
- Каждый task заканчивается коммитом.

## File structure

**Create:**

- `src/api/warehouseAccounting.js` — обёртки GET
- `src/components/dashboardPages/WarehouseAccounting/warehouseAccountingConstants.js`
- `src/components/dashboardPages/WarehouseAccounting/warehouseAccountingUtils.js`
- `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx` — контейнер
- `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingHeader.jsx`
- `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingToolbar.jsx`
- `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingSectionCards.jsx`
- `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingTable.jsx`
- `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingChart.jsx`
- `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingDocumentsDialog.jsx`

**Modify:**

- `src/utils/appBar.jsx` — имя вкладки и порядок
- `src/components/dashboard/listItems.jsx` — иконка
- `src/components/AppBarHeader.jsx` — заголовок шапки
- `src/components/dashboard/Dashboard.jsx` — ветка страницы

---

### Task 1: API, константы, утилиты

**Files:**
- Create: `src/api/warehouseAccounting.js`
- Create: `src/components/dashboardPages/WarehouseAccounting/warehouseAccountingConstants.js`
- Create: `src/components/dashboardPages/WarehouseAccounting/warehouseAccountingUtils.js`

**Interfaces:**
- Consumes: `httpService` из `src/api/setup.js`; `getApiErrorMessage` из `src/api/externalIntegrations.js`
- Produces:
  - `getWarehouseDictionaries()` → axios GET `/warehouse_accounting/dictionaries`
  - `getWarehouseMovement({ date_from, date_to })` → GET `/warehouse_accounting/movement`
  - `getWarehouseMovementDocuments({ storage_id, product_id, income, date_from, date_to })` → GET `/warehouse_accounting/movement/documents`
  - `getWarehouseSectionsSummary({ date_from, date_to })` → GET `/warehouse_accounting/sections_summary`
  - `getWarehouseStockByStorages({ date_to })` → GET `/warehouse_accounting/stock_by_storages`
  - `toApiDate(inputYmd: string) => string` (`2026-01-01` → `01-01-2026`)
  - `formatApiDateDisplay(apiDate: string | null) => string` (`06-06-2026` → `06.06.2026`)
  - `getDefaultWarehouseInterval() => { from: string, to: string }`
  - `sanitizeDateInputYear(value: string) => string`
  - `formatMoney(value) => string`
  - `formatQuantity(value, unit) => string`
  - `formatQuantities(list) => string`
  - `hasMovement(quantity, amount) => boolean`
  - `toggleId(ids: number[], id: number) => number[]`
  - `hasClientFilters({ storageIds, sectionIds, productIds }) => boolean`
  - `filterMovementRows(rows, { storageIds, sectionIds, productIds }) => rows`
  - `aggregateStockFromMovement(rows) => { total_amount: number, storages: Array<{ storage_id, storage_name, amount, quantities }> }`

- [ ] **Step 1: Создать константы**

Создать `src/components/dashboardPages/WarehouseAccounting/warehouseAccountingConstants.js`:

```javascript
export const WAREHOUSE_TAB = "warehouse_accounting";

export const OPENING_BALANCE_INPUT = "2026-01-01";

export const CHART_COLORS = [
  "#4285F4",
  "#34A853",
  "#FBBC05",
  "#EA4335",
  "#9C27B0",
  "#00BCD4",
  "#FF9800",
  "#4CAF50",
];

export const EMPTY_PERIOD_MESSAGE = "Нет данных за выбранный период";
export const EMPTY_FILTERS_MESSAGE = "Нет строк по выбранным фильтрам";
```

- [ ] **Step 2: Создать утилиты**

Создать `src/components/dashboardPages/WarehouseAccounting/warehouseAccountingUtils.js`:

```javascript
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

export const formatQuantity = (value, unit) => {
  if (value === null || value === undefined || value === "") return "—";
  const qty = ruNumber(value, 0, 3);
  return unit ? `${qty} ${unit}` : qty;
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
```

- [ ] **Step 3: Создать API-клиент**

Создать `src/api/warehouseAccounting.js`:

```javascript
import { httpService } from "./setup";
import { getApiErrorMessage } from "./externalIntegrations";

export function getWarehouseDictionaries() {
  return httpService.get("/warehouse_accounting/dictionaries");
}

export function getWarehouseMovement(params) {
  return httpService.get("/warehouse_accounting/movement", { params });
}

export function getWarehouseMovementDocuments(params) {
  return httpService.get("/warehouse_accounting/movement/documents", { params });
}

export function getWarehouseSectionsSummary(params) {
  return httpService.get("/warehouse_accounting/sections_summary", { params });
}

export function getWarehouseStockByStorages(params) {
  return httpService.get("/warehouse_accounting/stock_by_storages", { params });
}

export { getApiErrorMessage };
```

- [ ] **Step 4: Проверить утилиты вручную по примерам**

Ожидаемые результаты (сверить глазами / в консоли браузера после следующих задач):

- `toApiDate("2026-01-01")` → `"01-01-2026"`
- `formatApiDateDisplay("06-06-2026")` → `"06.06.2026"`
- `formatMoney(116328)` содержит `116 328,00` и `₽`
- `filterMovementRows([{storage_id:1,section_id:2,product_id:3}], {storageIds:[1],sectionIds:[],productIds:[]})` длина 1
- `filterMovementRows([{storage_id:1,section_id:2,product_id:3}], {storageIds:[9],sectionIds:[],productIds:[]})` длина 0
- `toggleId([1], 1)` → `[]`; `toggleId([], 2)` → `[2]`
- `hasClientFilters({storageIds:[],sectionIds:[],productIds:[]})` → `false`

- [ ] **Step 5: Commit**

```bash
git add src/api/warehouseAccounting.js \
  src/components/dashboardPages/WarehouseAccounting/warehouseAccountingConstants.js \
  src/components/dashboardPages/WarehouseAccounting/warehouseAccountingUtils.js
git commit -m "$(cat <<'EOF'
Добавлены API и утилиты склад-учёта.

EOF
)"
```

---

### Task 2: Вкладка в меню, шапке и Dashboard

**Files:**
- Modify: `src/utils/appBar.jsx`
- Modify: `src/components/dashboard/listItems.jsx`
- Modify: `src/components/AppBarHeader.jsx`
- Modify: `src/components/dashboard/Dashboard.jsx`
- Create: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx`

**Interfaces:**
- Consumes: `WAREHOUSE_TAB` из constants
- Produces: при `valueTabs === "warehouse_accounting"` рендерится `WarehouseAccountingPage`

- [ ] **Step 1: Имя и порядок вкладки**

В `src/utils/appBar.jsx` в `appBarName` добавить case перед `default`:

```javascript
      case 'warehouse_accounting':
          return "Склад-учёт"
```

Комментарий над `sortTabsByFixedOrder` дополнить пунктом `6. warehouse_accounting (Склад-учёт)`.

В `sortTabsByOrder` заменить массив порядка на:

```javascript
    const order = ['tech_map', 'fields', 'fields_v2', 'monitoring', 'cartogram', 'state_monitoring', 'warehouse_accounting'];
```

- [ ] **Step 2: Иконка в меню**

В `src/components/dashboard/listItems.jsx`:

1. Добавить импорт: `import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';`
2. В комментарии `useEffect` добавить пункт `6. warehouse_accounting (Склад-учёт)`.
3. В `getIconAppBar` перед `default` добавить:

```javascript
            case 'warehouse_accounting':
                return <WarehouseOutlinedIcon
                    sx={{color: valueTabs === "warehouse_accounting" ? "#82F865" : "", transition: 'all .2s ease-in-out'}}/>
```

- [ ] **Step 3: Заголовок шапки**

В `src/components/AppBarHeader.jsx` в `getNameTabs` перед `default`:

```javascript
            case "warehouse_accounting":
                return "Склад-учёт";
```

- [ ] **Step 4: Заглушка страницы и ветка Dashboard**

Создать `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx`:

```javascript
import React from "react";
import { Box, Typography } from "@mui/material";

const WarehouseAccountingPage = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Склад-учёт</Typography>
  </Box>
);

export default WarehouseAccountingPage;
```

В `src/components/dashboard/Dashboard.jsx`:

1. Импорт: `import WarehouseAccountingPage from "../dashboardPages/WarehouseAccounting/WarehouseAccountingPage";`
2. В `getPagesDashboard` перед `menu_settings`:

```javascript
            case "warehouse_accounting":
                return <WarehouseAccountingPage/>;
```

- [ ] **Step 5: Проверить вкладку**

Запустить `yarn start`. Пользователю с `warehouse_accounting` в `tabs` должен появиться пункт «Склад-учёт» (после госмониторинга). Клик открывает страницу с текстом «Склад-учёт». Без права пункта нет. Заголовок шапки — «Склад-учёт».

- [ ] **Step 6: Commit**

```bash
git add src/utils/appBar.jsx \
  src/components/dashboard/listItems.jsx \
  src/components/AppBarHeader.jsx \
  src/components/dashboard/Dashboard.jsx \
  src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx
git commit -m "$(cat <<'EOF'
Добавлена вкладка склад-учёта в меню и роутинг.

EOF
)"
```

---

### Task 3: Шапка, панель дат/фильтров и загрузка периода

**Files:**
- Create: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingHeader.jsx`
- Create: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingToolbar.jsx`
- Modify: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx` (полная замена)

**Interfaces:**
- Consumes: API-функции Task 1; `getDefaultWarehouseInterval`, `toApiDate`, `sanitizeDateInputYear`
- Produces: контейнер со state `dateFrom`, `dateTo`, `storageIds`, `sectionIds`, `productIds`, `dictionaries`, `movement`, `sectionsSummary`, `stockByStorages`, `loading`, независимые ошибки через snackbar

- [ ] **Step 1: Шапка страницы**

Создать `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingHeader.jsx`:

```javascript
import React from "react";
import { Box, Typography } from "@mui/material";

const WarehouseAccountingHeader = () => (
  <Box display="flex" gap={2} mb={0} flexWrap="wrap" alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
    <Typography
      sx={{
        background: "#62A65D",
        color: "white",
        padding: "8px 16px",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "16px",
      }}
      variant="body1"
    >
      Склад-учёт
    </Typography>
    <Typography variant="body1" sx={{ color: "#333", fontSize: "14px", alignSelf: "center" }}>
      Учёт товарно-материальных ценностей (источник данных 1С)
    </Typography>
  </Box>
);

export default WarehouseAccountingHeader;
```

- [ ] **Step 2: Панель дат и селектов**

Создать `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingToolbar.jsx`:

```javascript
import React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { sanitizeDateInputYear } from "./warehouseAccountingUtils";

const dateInputSx = {
  "& .MuiOutlinedInput-input": { cursor: "text" },
};

const renderMultiValue = (selected, items, emptyLabel) => {
  if (!selected.length) return emptyLabel;
  const names = selected
    .map((id) => items.find((item) => item.id === id)?.name)
    .filter(Boolean);
  return names.length ? names.join(", ") : emptyLabel;
};

const WarehouseAccountingToolbar = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  storages = [],
  sections = [],
  storageIds,
  sectionIds,
  onStorageIdsChange,
  onSectionIdsChange,
}) => (
  <Box sx={{ mt: 1 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        mt: 1,
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap", flex: "1 1 auto", minWidth: 0 }}>
        <TextField
          size="small"
          type="date"
          label="Дата начала"
          value={dateFrom}
          onChange={(e) => onDateFromChange(sanitizeDateInputYear(e.target.value))}
          inputProps={{ maxLength: 10, min: "1000-01-01", max: "9999-12-31" }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
          InputProps={{ sx: dateInputSx }}
        />
        <TextField
          size="small"
          type="date"
          label="Дата окончания"
          value={dateTo}
          onChange={(e) => onDateToChange(sanitizeDateInputYear(e.target.value))}
          inputProps={{ maxLength: 10, min: "1000-01-01", max: "9999-12-31" }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
          InputProps={{ sx: dateInputSx }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="warehouse-storages-label">Все склады</InputLabel>
          <Select
            labelId="warehouse-storages-label"
            multiple
            value={storageIds}
            label="Все склады"
            onChange={(e) => onStorageIdsChange(e.target.value)}
            renderValue={(selected) => renderMultiValue(selected, storages, "Все склады")}
          >
            {storages.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <Checkbox checked={storageIds.includes(item.id)} />
                <ListItemText primary={item.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="warehouse-sections-label">Разделы ТМЦ</InputLabel>
          <Select
            labelId="warehouse-sections-label"
            multiple
            value={sectionIds}
            label="Разделы ТМЦ"
            onChange={(e) => onSectionIdsChange(e.target.value)}
            renderValue={(selected) => renderMultiValue(selected, sections, "Разделы ТМЦ")}
          >
            {sections.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <Checkbox checked={sectionIds.includes(item.id)} />
                <ListItemText primary={item.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0, alignSelf: "flex-end" }}>
        <Button
          disabled
          variant="outlined"
          sx={{
            borderColor: "#62A65D",
            color: "#62A65D",
            textTransform: "uppercase",
            fontWeight: 600,
            px: 2,
            boxShadow: "none",
            padding: "8px 16px",
          }}
          startIcon={<SettingsOutlinedIcon />}
        >
          НАСТРОЙКИ
        </Button>
        <Button
          disabled
          variant="contained"
          sx={{
            backgroundColor: "#62A65D",
            color: "#fff",
            textTransform: "uppercase",
            fontWeight: 600,
            px: 2,
            boxShadow: "none",
            padding: "8px 16px",
          }}
          startIcon={<PlayArrowOutlinedIcon />}
        >
          ВЫПОЛНИТЬ
        </Button>
      </Box>
    </Box>
  </Box>
);

export default WarehouseAccountingToolbar;
```

- [ ] **Step 3: Контейнер с загрузкой четырёх запросов**

Заменить `WarehouseAccountingPage.jsx` целиком:

```javascript
import React, { useCallback, useEffect, useState } from "react";
import { Box, LinearProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  getApiErrorMessage,
  getWarehouseDictionaries,
  getWarehouseMovement,
  getWarehouseSectionsSummary,
  getWarehouseStockByStorages,
} from "../../../api/warehouseAccounting";
import { getDefaultWarehouseInterval, toApiDate } from "./warehouseAccountingUtils";
import WarehouseAccountingHeader from "./WarehouseAccountingHeader";
import WarehouseAccountingToolbar from "./WarehouseAccountingToolbar";

const WarehouseAccountingPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const defaults = getDefaultWarehouseInterval();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [storageIds, setStorageIds] = useState([]);
  const [sectionIds, setSectionIds] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [dictionaries, setDictionaries] = useState({ products: [], storages: [], sections: [] });
  const [movement, setMovement] = useState({ rows: [], last_operation_date: null });
  const [sectionsSummary, setSectionsSummary] = useState([]);
  const [stockByStorages, setStockByStorages] = useState({ storages: [], total_amount: 0, date: null });
  const [loading, setLoading] = useState(false);

  const loadPeriod = useCallback(
    async (from, to) => {
      const date_from = toApiDate(from);
      const date_to = toApiDate(to);
      if (!date_from || !date_to) return;
      setLoading(true);
      const results = await Promise.allSettled([
        getWarehouseDictionaries(),
        getWarehouseMovement({ date_from, date_to }),
        getWarehouseSectionsSummary({ date_from, date_to }),
        getWarehouseStockByStorages({ date_to }),
      ]);
      const labels = [
        "Не удалось загрузить справочники",
        "Не удалось загрузить движение ТМЦ",
        "Не удалось загрузить сводку по разделам",
        "Не удалось загрузить остатки по складам",
      ];
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          enqueueSnackbar(getApiErrorMessage(result.reason, labels[index]), { variant: "error" });
        }
      });
      if (results[0].status === "fulfilled") {
        const data = results[0].value?.data ?? {};
        setDictionaries({
          products: data.products ?? [],
          storages: data.storages ?? [],
          sections: data.sections ?? [],
        });
      }
      if (results[1].status === "fulfilled") {
        const data = results[1].value?.data ?? {};
        setMovement({
          rows: data.rows ?? [],
          last_operation_date: data.last_operation_date ?? null,
        });
      }
      if (results[2].status === "fulfilled") {
        setSectionsSummary(results[2].value?.data ?? []);
      }
      if (results[3].status === "fulfilled") {
        const data = results[3].value?.data ?? {};
        setStockByStorages({
          storages: data.storages ?? [],
          total_amount: data.total_amount ?? 0,
          date: data.date ?? null,
        });
      }
      setLoading(false);
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    loadPeriod(dateFrom, dateTo);
  }, [dateFrom, dateTo, loadPeriod]);

  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
        <WarehouseAccountingHeader />
      </Box>
      <WarehouseAccountingToolbar
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        storages={dictionaries.storages}
        sections={dictionaries.sections}
        storageIds={storageIds}
        sectionIds={sectionIds}
        onStorageIdsChange={setStorageIds}
        onSectionIdsChange={setSectionIds}
      />
      {loading ? <LinearProgress sx={{ mt: 2 }} /> : null}
    </Box>
  );
};

export default WarehouseAccountingPage;
```

Скрытый `Box` нужен, чтобы eslint не ругался на неиспользованные переменные до Task 4–6. В Task 4 его удалить, когда переменные пойдут в UI.

- [ ] **Step 4: Проверить загрузку**

Открыть вкладку: даты `01.01.2026` и сегодня, селекты «Все склады» и «Разделы ТМЦ» заполнены из API, «Настройки» и «Выполнить» серые. В Network — четыре GET на `/warehouse_accounting/*`. Смена даты окончания порождает новые запросы. Остановка бэкенда даёт snackbar, страница не падает.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingHeader.jsx \
  src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingToolbar.jsx \
  src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx
git commit -m "$(cat <<'EOF'
Добавлены шапка, фильтры и загрузка данных склад-учёта.

EOF
)"
```

---

### Task 4: Карточки разделов

**Files:**
- Create: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingSectionCards.jsx`
- Modify: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx`

**Interfaces:**
- Consumes: `sectionsSummary: Array<{ section_id, section_name, closing_amount, closing_quantities }>`, `sectionIds`, `onToggleSection(id)`
- Produces: клик по карточке вызывает `toggleId` через колбэк страницы

- [ ] **Step 1: Компонент карточек**

Создать `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingSectionCards.jsx`:

```javascript
import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { formatMoney, formatQuantities } from "./warehouseAccountingUtils";

const WarehouseAccountingSectionCards = ({ items = [], selectedIds = [], onToggle }) => {
  if (!items.length) return null;
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
      {items.map((item) => {
        const selected = selectedIds.includes(item.section_id);
        return (
          <Paper
            key={item.section_id}
            onClick={() => onToggle(item.section_id)}
            variant="outlined"
            sx={{
              p: 1.5,
              minWidth: 160,
              cursor: "pointer",
              borderColor: selected ? "#62A65D" : "#e0e0e0",
              backgroundColor: selected ? "rgba(98, 166, 93, 0.12)" : "#fff",
              boxShadow: "none",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>{item.section_name}</Typography>
            <Typography sx={{ fontSize: 12, color: "#555", mb: 0.5 }}>
              {formatQuantities(item.closing_quantities)}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{formatMoney(item.closing_amount)}</Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

export default WarehouseAccountingSectionCards;
```

- [ ] **Step 2: Вставить карточки в страницу**

В `WarehouseAccountingPage.jsx`:

1. Импорт: `import WarehouseAccountingSectionCards from "./WarehouseAccountingSectionCards";`
2. В импорт из `./warehouseAccountingUtils` добавить `toggleId`.
3. Сразу после `{loading ? <LinearProgress .../> : null}` вставить:

```javascript
      <WarehouseAccountingSectionCards
        items={sectionsSummary}
        selectedIds={sectionIds}
        onToggle={(id) => setSectionIds((prev) => toggleId(prev, id))}
      />
```

- [ ] **Step 3: Проверить карточки**

Карточки приходят с `/sections_summary`, не хардкод. Клик подсвечивает карточку и отмечает тот же id в «Разделы ТМЦ». Повторный клик снимает выбор. Несколько карточек можно выбрать сразу. Смена склада в селекте суммы карточек не меняет.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingSectionCards.jsx \
  src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx
git commit -m "$(cat <<'EOF'
Добавлены кликабельные карточки разделов ТМЦ.

EOF
)"
```

---

### Task 5: Таблица движения

**Files:**
- Create: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingTable.jsx`
- Modify: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx`

**Interfaces:**
- Consumes: `rows` (уже отфильтрованные), `products`, `productIds`, `onProductIdsChange`, `lastOperationDate`, `loading`, `filtersActive`, `onOpenDocuments({ storage_id, product_id, product_name, storage_name, income })`
- Produces: клик по **i** вызывает `onOpenDocuments` (обработчик-заглушка до Task 7)

- [ ] **Step 1: Компонент таблицы**

Создать `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingTable.jsx`:

```javascript
import React from "react";
import {
  Box,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { EMPTY_FILTERS_MESSAGE, EMPTY_PERIOD_MESSAGE } from "./warehouseAccountingConstants";
import {
  formatApiDateDisplay,
  formatMoney,
  formatQuantity,
  hasMovement,
} from "./warehouseAccountingUtils";

const headCell = { fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", borderBottom: "1px solid #e0e0e0" };

const WarehouseAccountingTable = ({
  rows = [],
  products = [],
  productIds,
  onProductIdsChange,
  lastOperationDate,
  loading,
  filtersActive,
  onOpenDocuments,
}) => {
  const emptyMessage = filtersActive ? EMPTY_FILTERS_MESSAGE : EMPTY_PERIOD_MESSAGE;
  return (
    <Box sx={{ mt: 2, flex: 1, minWidth: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
          Движение ТМЦ: приход, расход и остаток ТМЦ на складе
        </Typography>
        {lastOperationDate ? (
          <Typography sx={{ fontSize: 13, color: "#555" }}>
            Последняя операция — {formatApiDateDisplay(lastOperationDate)}
          </Typography>
        ) : null}
      </Box>
      <FormControl size="small" sx={{ minWidth: 260, mb: 1 }}>
        <InputLabel id="warehouse-products-label">Все наименования</InputLabel>
        <Select
          labelId="warehouse-products-label"
          multiple
          value={productIds}
          label="Все наименования"
          onChange={(e) => onProductIdsChange(e.target.value)}
          renderValue={(selected) => {
            if (!selected.length) return "Все наименования";
            return selected
              .map((id) => products.find((item) => item.id === id)?.name)
              .filter(Boolean)
              .join(", ") || "Все наименования";
          }}
        >
          {products.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              <Checkbox checked={productIds.includes(item.id)} />
              <ListItemText primary={item.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "#e0e0e0", overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headCell} rowSpan={2}>Наименование</TableCell>
              <TableCell sx={headCell} rowSpan={2}>Склад</TableCell>
              <TableCell sx={headCell} align="center" colSpan={2}>Нач. остаток</TableCell>
              <TableCell sx={headCell} align="center" colSpan={3}>Приход</TableCell>
              <TableCell sx={headCell} rowSpan={2} align="right">Средняя цена</TableCell>
              <TableCell sx={headCell} align="center" colSpan={3}>Расход</TableCell>
              <TableCell sx={headCell} align="center" colSpan={2}>Кон. остаток</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={headCell} align="right">Кол-во</TableCell>
              <TableCell sx={headCell} align="right">Сумма</TableCell>
              <TableCell sx={headCell} align="right">Кол-во</TableCell>
              <TableCell sx={headCell} align="right">Сумма</TableCell>
              <TableCell sx={headCell} />
              <TableCell sx={headCell} align="right">Кол-во</TableCell>
              <TableCell sx={headCell} align="right">Сумма</TableCell>
              <TableCell sx={headCell} />
              <TableCell sx={headCell} align="right">Кол-во</TableCell>
              <TableCell sx={headCell} align="right">Сумма</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} sx={{ fontSize: 13, color: "#666" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.product_id}-${row.storage_id}-${row.section_id}`}>
                  <TableCell sx={{ fontSize: 13 }}>{row.product_name}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{row.storage_name}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatQuantity(row.opening_quantity, row.unit)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatMoney(row.opening_amount)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatQuantity(row.income_quantity, row.unit)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatMoney(row.income_amount)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="center">
                    {hasMovement(row.income_quantity, row.income_amount) ? (
                      <IconButton
                        size="small"
                        onClick={() =>
                          onOpenDocuments({
                            storage_id: row.storage_id,
                            product_id: row.product_id,
                            product_name: row.product_name,
                            storage_name: row.storage_name,
                            income: true,
                          })
                        }
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">
                    {row.avg_price === null || row.avg_price === undefined ? "—" : formatMoney(row.avg_price)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatQuantity(row.expense_quantity, row.unit)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatMoney(row.expense_amount)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="center">
                    {hasMovement(row.expense_quantity, row.expense_amount) ? (
                      <IconButton
                        size="small"
                        onClick={() =>
                          onOpenDocuments({
                            storage_id: row.storage_id,
                            product_id: row.product_id,
                            product_name: row.product_name,
                            storage_name: row.storage_name,
                            income: false,
                          })
                        }
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatQuantity(row.closing_quantity, row.unit)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">{formatMoney(row.closing_amount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WarehouseAccountingTable;
```

- [ ] **Step 2: Вставить таблицу в страницу**

1. Импорт `WarehouseAccountingTable`.
2. В импорт React добавить `useMemo`.
3. В импорт из `./warehouseAccountingUtils` добавить `filterMovementRows` и `hasClientFilters`.
4. Добавить state:

```javascript
  const [documentsQuery, setDocumentsQuery] = useState(null);
```

5. Перед `return` добавить:

```javascript
  const filteredRows = useMemo(
    () => filterMovementRows(movement.rows, { storageIds, sectionIds, productIds }),
    [movement.rows, storageIds, sectionIds, productIds]
  );
  const filtersActive = hasClientFilters({ storageIds, sectionIds, productIds });
```

6. После карточек:

```javascript
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mt: 1, flexWrap: { xs: "wrap", lg: "nowrap" } }}>
        <WarehouseAccountingTable
          rows={filteredRows}
          products={dictionaries.products}
          productIds={productIds}
          onProductIdsChange={setProductIds}
          lastOperationDate={movement.last_operation_date}
          loading={loading}
          filtersActive={filtersActive}
          onOpenDocuments={setDocumentsQuery}
        />
      </Box>
```

`documentsQuery` подключается к модалке в Task 7. `stockByStorages` начнёт использоваться в Task 6.

- [ ] **Step 3: Проверить таблицу**

Колонки как в spec, суммы с `₽`, **i** только при ненулевом приходе/расходе. «Все наименования» режет строки. «Последняя операция» видна, если API вернул дату. Пустой фильтр / пустой период — разные тексты. Клик по **i** пока только выставляет state (модалка в Task 7).

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingTable.jsx \
  src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx
git commit -m "$(cat <<'EOF'
Добавлена таблица движения ТМЦ.

EOF
)"
```

---

### Task 6: Правая панель — график складов

**Files:**
- Create: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingChart.jsx`
- Modify: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx`

**Interfaces:**
- Consumes: `stockByStorages`, `filteredRows`, `filtersActive`
- Produces: если `filtersActive` — `aggregateStockFromMovement(filteredRows)`, иначе `stockByStorages`

- [ ] **Step 1: Компонент графика**

Создать `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingChart.jsx`:

```javascript
import React, { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Chart } from "react-google-charts";
import { CHART_COLORS } from "./warehouseAccountingConstants";
import { formatMoney, formatQuantities } from "./warehouseAccountingUtils";

const WarehouseAccountingChart = ({ stock }) => {
  const storages = stock?.storages ?? [];
  const chartData = useMemo(() => {
    if (!storages.length) return null;
    const data = [["Склад", "Сумма"]];
    storages.forEach((item) => data.push([item.storage_name, Number(item.amount) || 0]));
    return data;
  }, [storages]);
  const maxAmount = storages.reduce((max, item) => Math.max(max, Number(item.amount) || 0), 0);

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        width: { xs: "100%", lg: 360 },
        flexShrink: 0,
        borderColor: "#e0e0e0",
        boxShadow: "none",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
        Учёт запасов по складам (местам хранения)
      </Typography>
      {!storages.length || !chartData ? (
        <Typography sx={{ fontSize: 13, color: "#666" }}>Нет данных по складам</Typography>
      ) : (
        <>
          <Chart
            chartType="PieChart"
            data={chartData}
            options={{
              pieHole: 0.45,
              legend: "none",
              colors: CHART_COLORS,
              chartArea: { width: "90%", height: "90%" },
              pieSliceText: "none",
            }}
            width="100%"
            height="220px"
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            {storages.map((item, index) => {
              const color = CHART_COLORS[index % CHART_COLORS.length];
              const ratio = maxAmount ? (Number(item.amount) || 0) / maxAmount : 0;
              return (
                <Box key={item.storage_id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{item.storage_name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "#555", ml: 2.5 }}>
                    {formatQuantities(item.quantities)}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, ml: 2.5, mb: 0.5 }}>
                    {formatMoney(item.amount)}
                  </Typography>
                  <Box sx={{ ml: 2.5, height: 8, backgroundColor: "#eee", borderRadius: 1, overflow: "hidden" }}>
                    <Box sx={{ width: `${Math.round(ratio * 100)}%`, height: "100%", backgroundColor: color }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default WarehouseAccountingChart;
```

- [ ] **Step 2: Посчитать stock для графика и вставить панель**

В `WarehouseAccountingPage.jsx`:

1. В импорт utils добавить `aggregateStockFromMovement`.
2. Импорт `WarehouseAccountingChart`.
3. После `filtersActive`:

```javascript
  const chartStock = useMemo(() => {
    if (!filtersActive) return stockByStorages;
    return aggregateStockFromMovement(filteredRows);
  }, [filtersActive, stockByStorages, filteredRows]);
```

4. Внутри flex-контейнера рядом с таблицей:

```javascript
        <WarehouseAccountingChart stock={chartStock} />
```

- [ ] **Step 3: Проверить график**

Без фильтров доли и список совпадают с `/stock_by_storages`. Выбор склада/раздела/наименования пересчитывает график из строк таблицы (те же склады, что в отфильтрованной таблице). Пустой набор — текст «Нет данных по складам», не нулевой круг. Карточки при фильтрах не меняют суммы.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingChart.jsx \
  src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx
git commit -m "$(cat <<'EOF'
Добавлен график остатков по складам.

EOF
)"
```

---

### Task 7: Модалка документов

**Files:**
- Create: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingDocumentsDialog.jsx`
- Modify: `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx`

**Interfaces:**
- Consumes: `open`, `query: { storage_id, product_id, product_name, storage_name, income } | null`, `dateFrom`, `dateTo`, `onClose`
- Produces: внутри диалога `getWarehouseMovementDocuments` с `income`, периодом и id строки

- [ ] **Step 1: Диалог**

Создать `src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingDocumentsDialog.jsx`:

```javascript
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { getApiErrorMessage, getWarehouseMovementDocuments } from "../../../api/warehouseAccounting";
import { formatApiDateDisplay, formatMoney, formatQuantity, toApiDate } from "./warehouseAccountingUtils";

const WarehouseAccountingDocumentsDialog = ({ open, query, dateFrom, dateTo, onClose }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !query) return undefined;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      setRows([]);
      try {
        const res = await getWarehouseMovementDocuments({
          storage_id: query.storage_id,
          product_id: query.product_id,
          income: query.income,
          date_from: toApiDate(dateFrom),
          date_to: toApiDate(dateTo),
        });
        if (!cancelled) setRows(res?.data ?? []);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Не удалось загрузить документы"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, query, dateFrom, dateTo]);

  const titleType = query?.income ? "Приход" : "Расход";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{titleType}</Typography>
          <Typography sx={{ fontSize: 14, color: "#555" }}>
            {query?.product_name} · {query?.storage_name}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <Box sx={{ px: 3, pb: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Typography sx={{ color: "#d32f2f", fontSize: 14 }}>{error}</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Документ</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Количество</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Сумма</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: "#666" }}>Нет документов</TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={`${row.document_name}-${row.date}-${index}`}>
                    <TableCell>{formatApiDateDisplay(row.date)}</TableCell>
                    <TableCell>{row.document_name}</TableCell>
                    <TableCell align="right">{formatQuantity(row.quantity)}</TableCell>
                    <TableCell align="right">{formatMoney(row.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Box>
    </Dialog>
  );
};

export default WarehouseAccountingDocumentsDialog;
```

- [ ] **Step 2: Подключить к странице**

Импорт диалога. В конец корневого `Box` страницы, перед закрывающим тегом:

```javascript
      <WarehouseAccountingDocumentsDialog
        open={Boolean(documentsQuery)}
        query={documentsQuery}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onClose={() => setDocumentsQuery(null)}
      />
```

- [ ] **Step 3: Проверить модалку**

**i** у прихода: запрос `income=true`, список документов. **i** у расхода: `income=false`. Период в query совпадает с панелью. Ошибка API показывается внутри окна, таблица на странице остаётся. Закрытие крестиком сбрасывает `documentsQuery`.

- [ ] **Step 4: Финальный ручной прогон из spec**

1. Без права `warehouse_accounting` вкладки нет.
2. С правом страница открывается, период `01.01.2026`–сегодня, данные сразу.
3. Смена дат — четыре новых запроса.
4. Мультивыбор складов, разделов, карточек, наименований режет таблицу и график; карточки не меняют суммы.
5. Карточка и селект разделов синхронны.
6. **i** открывает документы прихода и расхода.
7. Пустой период и «всё отфильтровано» — разные заглушки.
8. «Настройки» и «Выполнить» видны и не кликаются.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingDocumentsDialog.jsx \
  src/components/dashboardPages/WarehouseAccounting/WarehouseAccountingPage.jsx
git commit -m "$(cat <<'EOF'
Добавлена модалка документов движения ТМЦ.

EOF
)"
```

---

## Self-review vs spec

| Spec | Task |
|---|---|
| Право `warehouse_accounting`, подпись, порядок меню | 2 |
| API-клиент четырёх GET + documents | 1, 7 |
| Период по умолчанию 01.01.2026–сегодня, загрузка при открытии и смене дат | 3 |
| Даты UI/API конвертация | 1, 3 |
| Мультивыбор складов / разделов / наименований, пусто = все | 3, 4, 5 |
| Карточки из `sections_summary`, клик = `sectionIds` | 4 |
| Таблица колонок, **i**, последняя операция, формат ₽ | 5 |
| График: без фильтров API, с фильтрами агрегация movement | 6 |
| Модалка documents | 7 |
| Disabled Настройки и Выполнить | 3 |
| Ошибки независимо, пустые состояния | 3, 5, 6, 7 |
| Без импорта S3, без правок бэкенда, без автотестов | — вне скоупа |
