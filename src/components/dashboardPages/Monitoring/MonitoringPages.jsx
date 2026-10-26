import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Tab, Typography } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import ZoomAwareTabList from "../../ZoomAwareTabList";
import { useSnackbar } from "notistack";
import {
  getMonitoring,
  getMonitoringById,
  getMonitoringFilterSettings,
  patchMonitoringRow,
  postMonitoringFilterSettings,
  postMonitoringMerge,
  postMonitoringSendToChat,
  postMonitoringStatus,
} from "../../../api/monitoring";
import MonitoringHeader from "./MonitoringHeader";
import MonitoringIntervalBar from "./MonitoringIntervalBar";
import MonitoringToolbar from "./MonitoringToolbar";
import MonitoringTable from "./MonitoringTable";
import MonitoringFilterLegend, { MonitoringStatusReference } from "./MonitoringFilterLegend";
import MonitoringSettingsDialog from "./MonitoringSettingsDialog";
import MonitoringRowDialog from "./MonitoringRowDialog";
import MonitoringStatusConfirmDialog from "./MonitoringStatusConfirmDialog";
import MonitoringPublish1CUnavailableDialog from "./MonitoringPublish1CUnavailableDialog";
import {
  MONITORING_DEFAULT_PAGE_SIZE,
  MONITORING_MAX_PAGE_SIZE,
  MONITORING_NON_EDITABLE_SENT_STATUSES,
  MONITORING_STATUS_CANCELED,
  MONITORING_STATUS_CONFIRMED,
  MONITORING_STATUS_PARTIALLY_CONFIRMED,
  MONITORING_STATUS_READY_FOR_1C,
  MONITORING_STATUS_RAW,
} from "./monitoringConstants";
import { buildLegend, COLUMN_SORT_BY, DEFAULT_FILTER_SETTINGS, monitoringStatusActions } from "./monitoringAutoFilter";
import { getDefaultMonitoringInterval, parseDatetimeLocal, toApiDateTimeString } from "./monitoringUtils";
import { monitoringRowIdsEqual } from "./monitoringIdUtils";
import { useMonitoringRowSelection } from "./useMonitoringRowSelection";
import CampaignsTab from "./Campaigns/CampaignsTab";

/** Обязательные поля строки в том виде, как они сохранены на сервере (последний GET/PATCH). */
const pickMonitoringDialogSavedIds = (row) =>
  row
    ? {
        driver_id: row.driver_id,
        tech_operation_id: row.tech_operation_id,
        trailer_id: row.trailer_id,
      }
    : null;

const monitoringIdComparable = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : n;
};

/** Есть ли несохранённые правки техоперации / прицепа / водителя относительно последнего ответа API. */
const monitoringSavedIdsDirty = (row, saved) => {
  if (!row || !saved) return false;
  return (
    monitoringIdComparable(row.driver_id) !== monitoringIdComparable(saved.driver_id) ||
    monitoringIdComparable(row.tech_operation_id) !== monitoringIdComparable(saved.tech_operation_id) ||
    monitoringIdComparable(row.trailer_id) !== monitoringIdComparable(saved.trailer_id)
  );
};

const plainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : null;

const filterSettingsFromPayload = (data) => {
  const source = plainObject(data) ?? {};
  const next = { ...source };
  delete next.updated_at;
  return { ...DEFAULT_FILTER_SETTINGS, ...next };
};

const equipmentGroupName = (groups, id) => {
  if (id == null) return "";
  const group = (groups ?? []).find((item) => String(item?.id) === String(id));
  return typeof group?.name === "string" ? group.name : "";
};

const MonitoringPages = ({ year: yearProp }) => {
  const { enqueueSnackbar } = useSnackbar();
  const year = Number(yearProp ?? localStorage.getItem("year") ?? new Date().getFullYear());

  const [intervalFrom, setIntervalFrom] = useState(() => getDefaultMonitoringInterval().from);
  const [intervalTo, setIntervalTo] = useState(() => getDefaultMonitoringInterval().to);
  const [appliedIntervalFrom, setAppliedIntervalFrom] = useState(() => getDefaultMonitoringInterval().from);
  const [appliedIntervalTo, setAppliedIntervalTo] = useState(() => getDefaultMonitoringInterval().to);

  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("period_start");
  const [sortOrder, setSortOrder] = useState("asc");
  const [clientSortKey, setClientSortKey] = useState(null);
  const [clientSortOrder, setClientSortOrder] = useState("asc");
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [equipmentGroupId, setEquipmentGroupId] = useState(null);
  const [equipmentGroups, setEquipmentGroups] = useState([]);
  const [filterSettings, setFilterSettings] = useState(DEFAULT_FILTER_SETTINGS);
  const [filterToggleLoading, setFilterToggleLoading] = useState(false);
  const [filterConfirmOpen, setFilterConfirmOpen] = useState(false);
  const [filterConfirmNext, setFilterConfirmNext] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { selectedRowIds, setSelectedRowIds, handleRowCheckedChange, pruneInvalidIds, isRowSelected } =
    useMonitoringRowSelection();
  const [legendRow, setLegendRow] = useState(null);
  const selectedRowIdsRef = useRef(selectedRowIds);
  selectedRowIdsRef.current = selectedRowIds;
  const legendSelectionId = selectedRowIds.length === 1 ? selectedRowIds[0] : null;
  const [statusCounts, setStatusCounts] = useState({});
  const [tabValue, setTabValue] = useState("1");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(MONITORING_DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogData, setDialogData] = useState(null);
  const [dialogActionLoading, setDialogActionLoading] = useState(false);
  const [dialogActiveAction, setDialogActiveAction] = useState(null);
  const [dialogSaveLoading, setDialogSaveLoading] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [sendMaxLoading, setSendMaxLoading] = useState(false);
  const hasExecutedSearchRef = useRef(false);
  const filterSettingsTouchedRef = useRef(false);
  /** { activeKey, nextStatus, successMessage } | null — ожидание подтверждения смены статуса */
  const [statusConfirm, setStatusConfirm] = useState(null);
  const [headerPublishConfirmOpen, setHeaderPublishConfirmOpen] = useState(false);
  const [publish1CUnavailableOpen, setPublish1CUnavailableOpen] = useState(false);
  const [sendMaxConfirmOpen, setSendMaxConfirmOpen] = useState(false);
  const [mergeConfirmOpen, setMergeConfirmOpen] = useState(false);
  /** Последние сохранённые на сервере id обязательных полей модалки (для блокировки подтверждения при несохранённых правках). */
  const [dialogSavedFieldIds, setDialogSavedFieldIds] = useState(null);

  const fetchMonitoringData = useCallback(
    async ({ targetPage = 1, targetPageSize = pageSize, from = appliedIntervalFrom, to = appliedIntervalTo } = {}) => {
      const start = toApiDateTimeString(from);
      const stop = toApiDateTimeString(to, { endOfDay: true });
      if (!start || !stop) return;

      setLoading(true);
      try {
        const safePageSize = Math.min(MONITORING_MAX_PAGE_SIZE, Math.max(1, targetPageSize));
        const params = {
          start,
          stop,
          page: targetPage,
          page_size: safePageSize,
          sort_by: sortBy,
          sort_order: sortOrder,
        };
        if (status !== "all") {
          params.status_value = status;
        }
        if (equipmentGroupId != null) {
          params.equipment_group_id = equipmentGroupId;
        }

        const res = await getMonitoring(params);
        const data = res?.data ?? res;
        const items = Array.isArray(data?.items) ? data.items : [];
        setRows(items);
        pruneInvalidIds(items);
        const t = typeof data?.total === "number" ? data.total : items.length;
        setTotal(t);
        setStatusCounts(data?.status_counts && typeof data.status_counts === "object" ? data.status_counts : {});
        const nextGroups = Array.isArray(data?.equipment_groups) ? data.equipment_groups : [];
        setEquipmentGroups(nextGroups);
        if (
          equipmentGroupId != null &&
          !nextGroups.some((group) => String(group?.id) === String(equipmentGroupId))
        ) {
          setEquipmentGroupId(null);
        }
        if (typeof data?.page === "number") setPage(data.page);
        else setPage(targetPage);
        if (typeof data?.page_size === "number") {
          setPageSize(Math.min(MONITORING_MAX_PAGE_SIZE, data.page_size));
        }
      } catch (err) {
        console.error(err);
        const msg =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.message ??
          "Не удалось загрузить данные мониторинга";
        enqueueSnackbar(typeof msg === "string" ? msg : "Ошибка запроса", { variant: "error", autoHideDuration: 4000 });
        setRows([]);
        setTotal(0);
        setStatusCounts({});
      } finally {
        setLoading(false);
      }
    },
    [appliedIntervalFrom, appliedIntervalTo, status, sortBy, sortOrder, equipmentGroupId, pageSize, pruneInvalidIds]
  );

  const fetchMonitoringDataRef = useRef(fetchMonitoringData);
  useEffect(() => {
    fetchMonitoringDataRef.current = fetchMonitoringData;
  }, [fetchMonitoringData]);

  const onRun = () => {
    const start = toApiDateTimeString(intervalFrom);
    const stop = toApiDateTimeString(intervalTo, { endOfDay: true });
    if (!start || !stop || !parseDatetimeLocal(intervalFrom) || !parseDatetimeLocal(intervalTo)) {
      enqueueSnackbar("Укажите корректный интервал дат", { variant: "warning" });
      return;
    }
    hasExecutedSearchRef.current = true;
    setSearchExecuted(true);
    setPage(1);
    setAppliedIntervalFrom(intervalFrom);
    setAppliedIntervalTo(intervalTo);
    fetchMonitoringData({ targetPage: 1, targetPageSize: pageSize, from: intervalFrom, to: intervalTo });
  };

  useEffect(() => {
    if (!hasExecutedSearchRef.current) return;
    setPage(1);
    fetchMonitoringDataRef.current({ targetPage: 1 });
  }, [status, sortBy, sortOrder, equipmentGroupId]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    fetchMonitoringData({ targetPage: nextPage, targetPageSize: pageSize });
  };

  const handleRowsPerPageChange = (nextSize) => {
    const safe = Math.min(MONITORING_MAX_PAGE_SIZE, Math.max(1, nextSize));
    setPageSize(safe);
    setPage(1);
    fetchMonitoringData({ targetPage: 1, targetPageSize: safe });
  };

  const handleRowClick = async (row) => {
    if (!row?.id) return;
    setDialogOpen(true);
    setDialogLoading(true);
    setDialogSavedFieldIds(null);
    try {
      const res = await getMonitoringById(row.id);
      const data = res?.data ?? null;
      setDialogData(data);
      setDialogSavedFieldIds(pickMonitoringDialogSavedIds(data?.row));
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Не удалось загрузить детали обработки", { variant: "error", autoHideDuration: 4000 });
      setDialogData(null);
      setDialogSavedFieldIds(null);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDialogRowChange = (patch) => {
    setDialogData((prev) => {
      if (!prev?.row) return prev;
      return {
        ...prev,
        row: {
          ...prev.row,
          ...patch,
        },
      };
    });
  };

  const toNullableId = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  };

  const getErrorMessage = (err, fallback) => {
    const d = err?.response?.data;
    const msg = d?.detail ?? d?.message ?? err?.message;
    return typeof msg === "string" ? msg : fallback;
  };

  useEffect(() => {
    const rowId = dialogData?.row?.id;
    if (!dialogOpen || !dialogData?.row?.is_track_loading || rowId == null || rowId === "") {
      return undefined;
    }

    let intervalId = null;
    let stopped = false;
    let snackbarShown = false;
    let inFlight = false;

    const stop = () => {
      stopped = true;
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const pollTrack = async () => {
      if (stopped || inFlight) return;
      inFlight = true;
      try {
        const res = await getMonitoringById(rowId);
        if (stopped) return;
        const incoming = res?.data?.row;
        if (!incoming) return;
        setDialogData((prev) => {
          if (!prev?.row || !monitoringRowIdsEqual(prev.row.id, rowId)) return prev;
          return {
            ...prev,
            row: {
              ...prev.row,
              track_points: incoming.track_points,
              is_track_loading: incoming.is_track_loading,
              source_changed_at: incoming.source_changed_at,
            },
          };
        });
        if (!incoming.is_track_loading) stop();
      } catch (err) {
        if (stopped) return;
        console.error(err);
        stop();
        if (!snackbarShown) {
          snackbarShown = true;
          enqueueSnackbar(getErrorMessage(err, "Не удалось загрузить трек"), {
            variant: "error",
            autoHideDuration: 4000,
          });
        }
      } finally {
        inFlight = false;
      }
    };

    intervalId = setInterval(pollTrack, 2000);
    return () => {
      stop();
    };
  }, [dialogOpen, dialogData?.row?.id, dialogData?.row?.is_track_loading, enqueueSnackbar]);

  useEffect(() => {
    if (legendSelectionId == null) {
      setLegendRow(null);
      return;
    }

    const rowId = legendSelectionId;
    setLegendRow(null);
    let cancelled = false;

    (async () => {
      try {
        const res = await getMonitoringById(rowId);
        const currentIds = selectedRowIdsRef.current;
        if (cancelled || currentIds.length !== 1 || !monitoringRowIdsEqual(currentIds[0], rowId)) return;
        setLegendRow(res?.data?.row ?? null);
      } catch (err) {
        if (cancelled) return;
        const currentIds = selectedRowIdsRef.current;
        if (currentIds.length !== 1 || !monitoringRowIdsEqual(currentIds[0], rowId)) return;
        setLegendRow(null);
        enqueueSnackbar(getErrorMessage(err, "Не удалось загрузить строку"), {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [legendSelectionId, enqueueSnackbar]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMonitoringFilterSettings();
        if (cancelled || filterSettingsTouchedRef.current) return;
        const body = plainObject(res?.data);
        if (!body) return;
        setFilterSettings(filterSettingsFromPayload(body));
      } catch (err) {
        if (cancelled || filterSettingsTouchedRef.current) return;
        if (err?.response?.status === 404) {
          setFilterSettings(DEFAULT_FILTER_SETTINGS);
          return;
        }
        enqueueSnackbar(getErrorMessage(err, "Не удалось загрузить настройки фильтра"), {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enqueueSnackbar]);

  const isSentOrReadyStatus = (row) =>
    MONITORING_NON_EDITABLE_SENT_STATUSES.includes(row?.status) || Boolean(row?.sent_to_1c);

  /** Пустой id в селектах модалки (техоперация, прицеп, водитель). */
  const isMonitoringRequiredIdEmpty = (value) =>
    value === null || value === undefined || value === "";

  /** Обязательные для перевода в «Подтверждённый» поля — как в форме редактирования. */
  const getMissingRequiredFields = (row) => {
    const missing = [];
    if (isMonitoringRequiredIdEmpty(row?.tech_operation_id)) missing.push("Техоперация");
    if (isMonitoringRequiredIdEmpty(row?.trailer_id)) missing.push("Прицепное устройство");
    if (isMonitoringRequiredIdEmpty(row?.driver_id)) missing.push("Водитель");
    return missing;
  };

  const openStatusConfirmIfValid = (activeKey, nextStatus, successMessage, canRunCheck) => {
    const row = dialogData?.row;
    const id = row?.id;
    if (!id) return;
    if (isSentOrReadyStatus(row)) {
      enqueueSnackbar("Статус «Отправленные» нельзя изменить", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }
    if (typeof canRunCheck === "function") {
      const canRun = canRunCheck(row);
      if (!canRun.ok) {
        enqueueSnackbar(canRun.message, {
          variant: "warning",
          autoHideDuration: 3500,
        });
        return;
      }
    }
    setStatusConfirm({ activeKey, nextStatus, successMessage, rowId: id });
  };

  const applyStatusChange = async () => {
    if (!statusConfirm) return;
    const { activeKey, nextStatus, successMessage, rowId } = statusConfirm;
    if (rowId == null) {
      setStatusConfirm(null);
      return;
    }
    setDialogActionLoading(true);
    setDialogActiveAction(activeKey);
    try {
      await postMonitoringStatus(rowId, nextStatus);
      enqueueSnackbar(successMessage, { variant: "success", autoHideDuration: 3000 });
      const res = await getMonitoringById(rowId);
      const data = res?.data ?? null;
      setDialogData(data);
      setDialogSavedFieldIds(pickMonitoringDialogSavedIds(data?.row));
      await fetchMonitoringData({ targetPage: page, targetPageSize: pageSize });
    } catch (err) {
      console.error(err);
      enqueueSnackbar(getErrorMessage(err, "Не удалось выполнить действие"), {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setDialogActionLoading(false);
      setDialogActiveAction(null);
      setStatusConfirm(null);
    }
  };

  const handleDialogReturn = () =>
    openStatusConfirmIfValid("return", MONITORING_STATUS_RAW, "Статус изменён", (row) => {
      if ([MONITORING_STATUS_CONFIRMED, MONITORING_STATUS_CANCELED, MONITORING_STATUS_PARTIALLY_CONFIRMED].includes(row?.status)) {
        return { ok: true };
      }
      return {
        ok: false,
        message: "Вернуть в сырой статус можно только из подтверждённой, частично подтверждённой или отменённой строки",
      };
    });

  const handleDialogReject = () =>
    openStatusConfirmIfValid("reject", MONITORING_STATUS_CANCELED, "Статус изменён", (row) => {
      if ([MONITORING_STATUS_RAW, MONITORING_STATUS_PARTIALLY_CONFIRMED].includes(row?.status)) return { ok: true };
      return { ok: false, message: "Отклонение доступно только для сырой или частично подтверждённой строки" };
    });

  const handleDialogConfirm = () =>
    openStatusConfirmIfValid("confirm", MONITORING_STATUS_CONFIRMED, "Статус изменён", (row) => {
      if (![MONITORING_STATUS_RAW, MONITORING_STATUS_PARTIALLY_CONFIRMED].includes(row?.status)) {
        return { ok: false, message: "Подтверждение доступно только для сырой или частично подтверждённой строки" };
      }
      const savedIds = dialogSavedFieldIds;
      if (!savedIds) {
        return { ok: false, message: "Данные строки ещё загружаются" };
      }
      const missingInForm = getMissingRequiredFields(row);
      if (missingInForm.length) {
        return {
          ok: false,
          message: `Заполните обязательные поля: ${missingInForm.join(", ")}`,
        };
      }
      if (monitoringSavedIdsDirty(row, savedIds)) {
        return {
          ok: false,
          message: "Перед переводом в подтверждённый статус сохраните изменения — нажмите кнопку Сохранить",
        };
      }
      const missingSaved = getMissingRequiredFields(savedIds);
      if (missingSaved.length) {
        return { ok: false, message: `Сохраните в базе обязательные поля: ${missingSaved.join(", ")}` };
      }
      return { ok: true };
    });

  const handleDialogPublish1C = () => {
    setPublish1CUnavailableOpen(true);
  };
  const handleDialogSave = async () => {
    const row = dialogData?.row;
    if (!row?.id) return;
    if (isSentOrReadyStatus(row)) {
      enqueueSnackbar("Статус «Отправленные» нельзя редактировать", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    const payload = {
      driver_id: toNullableId(row.driver_id),
      tech_operation_id: toNullableId(row.tech_operation_id),
      trailer_id: toNullableId(row.trailer_id),
    };

    setDialogSaveLoading(true);
    try {
      await patchMonitoringRow(row.id, payload);
      enqueueSnackbar("Изменения сохранены", { variant: "success", autoHideDuration: 3000 });
      const res = await getMonitoringById(row.id);
      const data = res?.data ?? null;
      setDialogData(data);
      setDialogSavedFieldIds(pickMonitoringDialogSavedIds(data?.row));
      await fetchMonitoringData({ targetPage: page, targetPageSize: pageSize });
    } catch (err) {
      console.error(err);
      enqueueSnackbar(getErrorMessage(err, "Не удалось сохранить изменения"), {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setDialogSaveLoading(false);
    }
  };

  const executeMerge = async () => {
    if (!canMerge) {
      enqueueSnackbar("Для объединения выберите более 1 подтвержденной строки", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }
    setMergeLoading(true);
    try {
      const rowIds = selectedRowIds.map((id) => Number(id)).filter((n) => Number.isFinite(n));
      await postMonitoringMerge(rowIds);
      enqueueSnackbar("Строки успешно объединены", { variant: "success", autoHideDuration: 2500 });
      setSelectedRowIds([]);
      await fetchMonitoringData({ targetPage: page, targetPageSize: pageSize });
    } catch (err) {
      console.error(err);
      enqueueSnackbar(getErrorMessage(err, "Не удалось выполнить объединение"), {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setMergeLoading(false);
    }
  };

  const onMerge = () => {
    if (mergeLoading || sendMaxLoading) return;
    if (!canMerge) {
      enqueueSnackbar("Для объединения выберите более 1 подтвержденной строки", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }
    setMergeConfirmOpen(true);
  };

  const selectedRows = rows.filter((row) => isRowSelected(row.id));
  const selectedConfirmedRows = selectedRows.filter((row) => row.status === MONITORING_STATUS_CONFIRMED);
  const selectedMaxSendRows = selectedRows.filter((row) =>
    [MONITORING_STATUS_CONFIRMED, MONITORING_STATUS_PARTIALLY_CONFIRMED, MONITORING_STATUS_READY_FOR_1C].includes(row.status)
  );
  const canMerge = selectedRowIds.length > 1 && selectedRows.length === selectedConfirmedRows.length;
  const canPublish1C = selectedRowIds.length >= 1 && selectedRows.length === selectedConfirmedRows.length;
  const dialogStatusActions = monitoringStatusActions(dialogData?.row?.status);
  const canSendMax = selectedRowIds.length >= 1 && selectedRows.length === selectedMaxSendRows.length;

  const executePublish1C = async () => {
    if (!canPublish1C) {
      enqueueSnackbar("Для публикации выберите минимум 1 подтвержденную строку", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }
    const rowIds = selectedRowIds.map((id) => Number(id)).filter((n) => Number.isFinite(n));
    if (!rowIds.length) {
      enqueueSnackbar("Не выбраны строки для публикации", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }

    setMergeLoading(true);
    try {
      const results = await Promise.allSettled(
        rowIds.map((rowId) => postMonitoringStatus(rowId, MONITORING_STATUS_READY_FOR_1C))
      );
      const successCount = results.filter((result) => result.status === "fulfilled").length;
      const failed = results.filter((result) => result.status === "rejected");

      if (successCount > 0) {
        enqueueSnackbar(
          successCount === rowIds.length
            ? "Строки успешно опубликованы в 1с"
            : `Опубликовано в 1с: ${successCount} из ${rowIds.length}`,
          { variant: "success", autoHideDuration: 3000 }
        );
      }

      if (failed.length > 0) {
        const firstError = failed[0]?.reason;
        enqueueSnackbar(getErrorMessage(firstError, "Не удалось опубликовать часть строк в 1с"), {
          variant: "error",
          autoHideDuration: 4500,
        });
      }

      setSelectedRowIds([]);
      await fetchMonitoringData({ targetPage: page, targetPageSize: pageSize });
    } catch (err) {
      console.error(err);
      enqueueSnackbar(getErrorMessage(err, "Не удалось выполнить публикацию в 1с"), {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setMergeLoading(false);
    }
  };

  const onPublish1C = () => {
    if (mergeLoading || sendMaxLoading) return;
    setPublish1CUnavailableOpen(true);
  };

  const executeSendMax = async () => {
    if (!canSendMax) {
      enqueueSnackbar("Для отправки в MAX выберите подтверждённые, частично подтверждённые или опубликованные в 1С строки", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    const rowIds = selectedRowIds.map((id) => Number(id)).filter((n) => Number.isFinite(n));
    if (!rowIds.length) {
      enqueueSnackbar("Не выбраны строки для отправки", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }

    setSendMaxLoading(true);
    try {
      await postMonitoringSendToChat(rowIds, ["MAX"]);
      enqueueSnackbar("Строки отправлены в MAX", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setSelectedRowIds([]);
    } catch (err) {
      console.error(err);
      enqueueSnackbar(getErrorMessage(err, "Не удалось отправить строки в MAX"), {
        variant: "error",
        autoHideDuration: 4500,
      });
    } finally {
      setSendMaxLoading(false);
    }
  };

  const onSendMax = () => {
    if (mergeLoading || sendMaxLoading) return;
    if (!canSendMax) {
      enqueueSnackbar("Для отправки в MAX выберите подтверждённые, частично подтверждённые или опубликованные в 1С строки", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }
    setSendMaxConfirmOpen(true);
  };

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  const handleColumnSort = (columnKey) => {
    const serverField = COLUMN_SORT_BY[columnKey];
    if (serverField) {
      setClientSortKey(null);
      if (!clientSortKey && sortBy === serverField) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }
      setSortBy(serverField);
      setSortOrder("asc");
      return;
    }
    if (clientSortKey === columnKey) {
      setClientSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setClientSortKey(columnKey);
    setClientSortOrder("asc");
  };

  const activeSortColumn = clientSortKey
    ?? Object.entries(COLUMN_SORT_BY).find(([, field]) => field === sortBy)?.[0]
    ?? "period";

  const handleEquipmentGroupChange = (nextId) => {
    if (nextId == null || nextId === "all") {
      setEquipmentGroupId(null);
      return;
    }
    const match = equipmentGroups.find((group) => String(group?.id) === String(nextId));
    setEquipmentGroupId(match ? match.id : nextId);
  };

  const requestFilterEnabledChange = (next) => {
    if (filterToggleLoading) return;
    setFilterConfirmNext(next);
    setFilterConfirmOpen(true);
  };

  const confirmFilterEnabledChange = async () => {
    const next = filterConfirmNext;
    setFilterConfirmOpen(false);
    await handleFilterEnabledChange(next);
  };

  const handleFilterEnabledChange = async (next) => {
    if (filterToggleLoading) return;
    setFilterToggleLoading(true);
    try {
      const payload = { ...filterSettings, enabled: next };
      delete payload.updated_at;
      const res = await postMonitoringFilterSettings(payload);
      filterSettingsTouchedRef.current = true;
      setFilterSettings(filterSettingsFromPayload(plainObject(res?.data) ?? payload));
    } catch (err) {
      console.error(err);
      enqueueSnackbar(getErrorMessage(err, "Не удалось сохранить автофильтрование"), {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setFilterToggleLoading(false);
    }
  };

  const handleFilterSaved = (payload) => {
    filterSettingsTouchedRef.current = true;
    setFilterSettings(filterSettingsFromPayload(payload));
  };

  if (
    legendRow != null &&
    (legendSelectionId == null || !monitoringRowIdsEqual(legendRow.id, legendSelectionId))
  ) {
    setLegendRow(null);
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        p: 1,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <TabContext value={tabValue}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
            <ZoomAwareTabList onChange={handleTabChange} aria-label="Вкладки мониторинга">
              <Tab sx={{ color: "black !important" }} label="Обработки" value="1" />
              <Tab sx={{ color: "black !important" }} label="Ход выполнения" value="3" />
            </ZoomAwareTabList>
          </Box>

          <TabPanel
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              padding: "8px 0 0 0",
              "&[hidden]": { display: "none" },
            }}
            value="1"
          >
            <Box sx={{ flexShrink: 0 }}>
              <MonitoringHeader
                year={year}
                onPublish1C={onPublish1C}
                publishDisabled={sendMaxLoading || mergeLoading || !canPublish1C}
                onSendMax={onSendMax}
                sendMaxDisabled={!canSendMax || mergeLoading}
                sendMaxLoading={sendMaxLoading}
                onMerge={onMerge}
                mergeDisabled={!canMerge || sendMaxLoading}
                mergeLoading={mergeLoading}
              />
            </Box>

            <LinearProgress sx={{ mt: 0.5, flexShrink: 0, visibility: loading ? "visible" : "hidden" }} />

            <Box sx={{ flexShrink: 0 }}>
              <MonitoringIntervalBar
                intervalFrom={intervalFrom}
                setIntervalFrom={setIntervalFrom}
                intervalTo={intervalTo}
                setIntervalTo={setIntervalTo}
                onRun={onRun}
                onOpenSettings={() => setFilterOpen(true)}
              />
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <MonitoringToolbar
                status={status}
                onStatusChange={setStatus}
                equipmentGroups={equipmentGroups}
                equipmentGroupId={equipmentGroupId}
                onEquipmentGroupChange={handleEquipmentGroupChange}
                filterEnabled={Boolean(filterSettings.enabled)}
                filterToggleDisabled={filterToggleLoading || filterOpen}
                onFilterEnabledChange={requestFilterEnabledChange}
                onOpenFilterInfo={() => setFilterOpen(true)}
                statusCounts={statusCounts}
                total={total}
                hasSelection={selectedRowIds.length > 0}
                onClearSelection={() => setSelectedRowIds([])}
              />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pb: 1 }}>
              <MonitoringTable
                rows={rows}
                total={total}
                page={page}
                pageSize={pageSize}
                isRowSelected={isRowSelected}
                onRowCheckedChange={handleRowCheckedChange}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onRowClick={handleRowClick}
                sortColumnKey={activeSortColumn}
                sortOrder={clientSortKey ? clientSortOrder : sortOrder}
                clientSortKey={clientSortKey}
                onColumnSort={handleColumnSort}
                groupTitle={equipmentGroupId != null ? equipmentGroupName(equipmentGroups, equipmentGroupId) : ""}
                statusReference={searchExecuted ? null : <MonitoringStatusReference />}
              />
              {searchExecuted && selectedRowIds.length === 1 ? (
                <MonitoringFilterLegend items={buildLegend(legendRow)} />
              ) : null}
            </Box>
          </TabPanel>

          <TabPanel
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              padding: "8px 0 0 0",
              "&[hidden]": { display: "none" },
            }}
            value="3"
          >
            <CampaignsTab active={tabValue === "3"} year={year} />
          </TabPanel>
        </Box>
      </TabContext>

      <MonitoringSettingsDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onFilterSaved={handleFilterSaved}
      />
      <Dialog open={filterConfirmOpen} onClose={() => setFilterConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Автофильтрование строк</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {filterConfirmNext ? "Включить автофильтрование строк?" : "Выключить автофильтрование строк?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFilterConfirmOpen(false)} disabled={filterToggleLoading}>
            Отмена
          </Button>
          <Button
            onClick={confirmFilterEnabledChange}
            variant="contained"
            disabled={filterToggleLoading}
            sx={{ backgroundColor: "#62A65D", boxShadow: "none", "&:hover": { backgroundColor: "#4f8f4b", boxShadow: "none" } }}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
      <MonitoringRowDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setDialogSavedFieldIds(null);
        }}
        loading={dialogLoading}
        data={dialogData}
        year={year}
        actionLoading={dialogActionLoading}
        activeAction={dialogActiveAction}
        canEditStatus={!isSentOrReadyStatus(dialogData?.row)}
        canConfirm={dialogStatusActions.canConfirm}
        canReject={dialogStatusActions.canReject}
        canReturn={dialogStatusActions.canReturn}
        canPublish1C={dialogStatusActions.canPublish1C}
        showPartialLabel={dialogStatusActions.showPartialLabel}
        onRowChange={handleDialogRowChange}
        onSave={handleDialogSave}
        saveLoading={dialogSaveLoading}
        onReturn={handleDialogReturn}
        onReject={handleDialogReject}
        onConfirm={handleDialogConfirm}
        onPublish1C={handleDialogPublish1C}
      />
      <MonitoringPublish1CUnavailableDialog
        open={publish1CUnavailableOpen}
        onClose={() => setPublish1CUnavailableOpen(false)}
      />
      <MonitoringStatusConfirmDialog
        open={Boolean(statusConfirm)}
        nextStatus={statusConfirm?.nextStatus}
        loading={dialogActionLoading}
        onConfirm={applyStatusChange}
        onCancel={() => {
          if (!dialogActionLoading) setStatusConfirm(null);
        }}
      />
      <MonitoringStatusConfirmDialog
        open={headerPublishConfirmOpen}
        nextStatus={MONITORING_STATUS_READY_FOR_1C}
        loading={mergeLoading}
        onConfirm={() => {
          setHeaderPublishConfirmOpen(false);
          executePublish1C();
        }}
        onCancel={() => {
          if (!mergeLoading) setHeaderPublishConfirmOpen(false);
        }}
      />
      <MonitoringStatusConfirmDialog
        open={sendMaxConfirmOpen}
        title="Отправка в MAX"
        loading={sendMaxLoading}
        onConfirm={() => {
          setSendMaxConfirmOpen(false);
          executeSendMax();
        }}
        onCancel={() => {
          if (!sendMaxLoading) setSendMaxConfirmOpen(false);
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Отправить выбранные строки ({selectedRowIds.length}) в подключённую группу MAX?
        </Typography>
      </MonitoringStatusConfirmDialog>
      <MonitoringStatusConfirmDialog
        open={mergeConfirmOpen}
        title="Подтверждение объединения"
        loading={mergeLoading}
        onConfirm={() => {
          setMergeConfirmOpen(false);
          executeMerge();
        }}
        onCancel={() => {
          if (!mergeLoading) setMergeConfirmOpen(false);
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Объединить выбранные подтверждённые строки ({selectedRowIds.length}) в одну запись?
        </Typography>
      </MonitoringStatusConfirmDialog>
    </Box>
  );
};

export default MonitoringPages;
