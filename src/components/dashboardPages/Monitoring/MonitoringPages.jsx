import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, LinearProgress, Tab, Typography } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useSnackbar } from "notistack";
import {
  getMonitoring,
  getMonitoringById,
  patchMonitoringRow,
  postMonitoringMerge,
  postMonitoringStatus,
} from "../../../api/monitoring";
import MonitoringHeader from "./MonitoringHeader";
import MonitoringIntervalBar from "./MonitoringIntervalBar";
import MonitoringToolbar from "./MonitoringToolbar";
import MonitoringTable from "./MonitoringTable";
import MonitoringSettingsDialog from "./MonitoringSettingsDialog";
import MonitoringRowDialog from "./MonitoringRowDialog";
import MonitoringStatusConfirmDialog from "./MonitoringStatusConfirmDialog";
import {
  MONITORING_DEFAULT_PAGE_SIZE,
  MONITORING_MAX_PAGE_SIZE,
  MONITORING_NON_EDITABLE_SENT_STATUSES,
  MONITORING_STATUS_CANCELED,
  MONITORING_STATUS_CONFIRMED,
  MONITORING_STATUS_READY_FOR_1C,
  MONITORING_STATUS_RAW,
} from "./monitoringConstants";
import { getDefaultMonitoringInterval, parseDatetimeLocal, toApiDateTimeString } from "./monitoringUtils";
import { useMonitoringRowSelection } from "./useMonitoringRowSelection";

const MonitoringPages = ({ year: yearProp }) => {
  const { enqueueSnackbar } = useSnackbar();
  const year = Number(yearProp ?? localStorage.getItem("year") ?? new Date().getFullYear());

  const [intervalFrom, setIntervalFrom] = useState(() => getDefaultMonitoringInterval().from);
  const [intervalTo, setIntervalTo] = useState(() => getDefaultMonitoringInterval().to);

  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("period_start");
  const [sortOrder, setSortOrder] = useState("asc");

  const [filterOpen, setFilterOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const { selectedRowIds, setSelectedRowIds, handleRowCheckedChange, pruneInvalidIds, isRowSelected } =
    useMonitoringRowSelection();
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
  const hasExecutedSearchRef = useRef(false);
  /** { activeKey, nextStatus, successMessage } | null — ожидание подтверждения смены статуса */
  const [statusConfirm, setStatusConfirm] = useState(null);

  const fetchMonitoringData = useCallback(
    async ({ targetPage = 1, targetPageSize = pageSize } = {}) => {
      const start = toApiDateTimeString(intervalFrom);
      const stop = toApiDateTimeString(intervalTo);
      if (!start || !stop || !parseDatetimeLocal(intervalFrom) || !parseDatetimeLocal(intervalTo)) {
        enqueueSnackbar("Укажите корректный интервал дат", { variant: "warning" });
        return;
      }

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

        const res = await getMonitoring(params);
        const data = res?.data ?? res;
        const items = Array.isArray(data?.items) ? data.items : [];
        setRows(items);
        pruneInvalidIds(items);
        const t = typeof data?.total === "number" ? data.total : items.length;
        setTotal(t);
        setStatusCounts(data?.status_counts && typeof data.status_counts === "object" ? data.status_counts : {});
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
    [intervalFrom, intervalTo, status, sortBy, sortOrder, pageSize, enqueueSnackbar, pruneInvalidIds]
  );

  const onRun = () => {
    hasExecutedSearchRef.current = true;
    setPage(1);
    fetchMonitoringData({ targetPage: 1, targetPageSize: pageSize });
  };

  useEffect(() => {
    if (!hasExecutedSearchRef.current) return;
    setPage(1);
    fetchMonitoringData({ targetPage: 1 });
  }, [status, sortBy, sortOrder, fetchMonitoringData]);

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
    try {
      const res = await getMonitoringById(row.id);
      setDialogData(res?.data ?? null);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Не удалось загрузить детали обработки", { variant: "error", autoHideDuration: 4000 });
      setDialogData(null);
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

  const isSentOrReadyStatus = (row) =>
    MONITORING_NON_EDITABLE_SENT_STATUSES.includes(row?.status) || Boolean(row?.sent_to_1c);

  const getMissingRequiredFields = (row) => {
    const missing = [];
    if (!row?.tech_operation_id) missing.push("технологическая операция");
    if (!row?.trailer_id) missing.push("прицепное устройство");
    if (!row?.driver_id) missing.push("водитель");
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
      setDialogData(res?.data ?? null);
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
      if ([MONITORING_STATUS_CONFIRMED, MONITORING_STATUS_CANCELED].includes(row?.status)) return { ok: true };
      return { ok: false, message: "Вернуть в сырой статус можно только из подтверждённой или отменённой строки" };
    });

  const handleDialogReject = () =>
    openStatusConfirmIfValid("reject", MONITORING_STATUS_CANCELED, "Статус изменён", (row) => {
      if ([MONITORING_STATUS_RAW, MONITORING_STATUS_CONFIRMED].includes(row?.status)) return { ok: true };
      return { ok: false, message: "Отклонение доступно только для сырой или подтверждённой строки" };
    });

  const handleDialogConfirm = () =>
    openStatusConfirmIfValid("confirm", MONITORING_STATUS_CONFIRMED, "Статус изменён", (row) => {
      if (row?.status !== MONITORING_STATUS_RAW) {
        return { ok: false, message: "Подтверждение доступно только для сырой строки" };
      }
      const missing = getMissingRequiredFields(row);
      if (missing.length) {
        return { ok: false, message: `Заполните обязательные поля: ${missing.join(", ")}` };
      }
      return { ok: true };
    });

  const handleDialogPublish1C = () =>
    openStatusConfirmIfValid("publish_1c", MONITORING_STATUS_READY_FOR_1C, "Статус изменён", (row) => {
      if (row?.status !== MONITORING_STATUS_CONFIRMED) {
        return { ok: false, message: "Публикация в 1С доступна только для подтверждённой строки" };
      }
      return { ok: true };
    });

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
      setDialogData(res?.data ?? null);
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

  const onMerge = async () => {
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

  const selectedRows = rows.filter((row) => isRowSelected(row.id));
  const selectedConfirmedRows = selectedRows.filter((row) => row.status === MONITORING_STATUS_CONFIRMED);
  const canMerge = selectedRowIds.length > 1 && selectedRows.length === selectedConfirmedRows.length;
  const canPublish1C = selectedRowIds.length >= 1 && selectedRows.length === selectedConfirmedRows.length;

  const onPublish1C = async () => {
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

  const handleApplySettings = () => {
    setFilterOpen(false);
    enqueueSnackbar("Настройки применены (макет)", { variant: "success", autoHideDuration: 2500 });
  };

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        border: "2px solid #1976d2",
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
            <TabList onChange={handleTabChange} aria-label="Вкладки мониторинга">
              <Tab sx={{ color: "black !important" }} label="Обработки" value="1" />
              <Tab sx={{ color: "black !important" }} label="Сводка" value="2" disabled />
            </TabList>
          </Box>

          <TabPanel
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              padding: "8px 0 0 0",
            }}
            value="1"
          >
            <Box sx={{ flexShrink: 0 }}>
              <MonitoringHeader
                year={year}
                onPublish1C={onPublish1C}
                publishDisabled={!canPublish1C}
                onMerge={onMerge}
                mergeDisabled={!canMerge}
                mergeLoading={mergeLoading}
              />
            </Box>

            {loading ? (
              <LinearProgress sx={{ mt: 0.5, flexShrink: 0 }} />
            ) : null}

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
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
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
              />
            </Box>
          </TabPanel>

          <TabPanel sx={{ padding: 2, flex: 1, minHeight: 0, overflow: "auto" }} value="2">
            <Typography variant="body2" color="text.secondary">
              Раздел «Сводка» будет доступен позже.
            </Typography>
          </TabPanel>
        </Box>
      </TabContext>

      <MonitoringSettingsDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        status={status}
        onApply={handleApplySettings}
      />
      <MonitoringRowDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        loading={dialogLoading}
        data={dialogData}
        year={year}
        actionLoading={dialogActionLoading}
        activeAction={dialogActiveAction}
        canEditStatus={!isSentOrReadyStatus(dialogData?.row)}
        canConfirm={dialogData?.row?.status === MONITORING_STATUS_RAW}
        canReject={[MONITORING_STATUS_RAW, MONITORING_STATUS_CONFIRMED].includes(dialogData?.row?.status)}
        canReturn={[MONITORING_STATUS_CONFIRMED, MONITORING_STATUS_CANCELED].includes(dialogData?.row?.status)}
        canPublish1C={dialogData?.row?.status === MONITORING_STATUS_CONFIRMED}
        onRowChange={handleDialogRowChange}
        onSave={handleDialogSave}
        saveLoading={dialogSaveLoading}
        onReturn={handleDialogReturn}
        onReject={handleDialogReject}
        onConfirm={handleDialogConfirm}
        onPublish1C={handleDialogPublish1C}
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
    </Box>
  );
};

export default MonitoringPages;
