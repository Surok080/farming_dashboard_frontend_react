import React, { useMemo } from "react";
import {
  Box,
  ButtonBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  MONITORING_PAGE_SIZE_OPTIONS,
  MONITORING_STATUS_CANCELED,
  MONITORING_STATUS_CANCELED_ROW_BG,
  MONITORING_STATUS_OPTIONS,
  MONITORING_STATUS_PARTIAL_ROW_BG,
  MONITORING_STATUS_PARTIALLY_CONFIRMED,
} from "./monitoringConstants";
import { MONITORING_TABLE_COLUMNS } from "./monitoringColumns";
import { formatSourceChangedAt } from "./monitoringAutoFilter";
import MonitoringStatusCell from "./MonitoringStatusCell";
import { formatNumberForDisplay, getPeriodRangeDisplayParts } from "./monitoringUtils";

const displayText = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
};

const displayNum = (v) => {
  const f = formatNumberForDisplay(v, 3);
  if (!f.hasTooltip) return f.display;
  return (
    <Tooltip title={f.full} enterDelay={400} arrow placement="top">
      <Box component="span" sx={{ display: "inline-block", cursor: "help", borderBottom: "1px dotted rgba(0,0,0,0.25)" }}>
        {f.display}
      </Box>
    </Tooltip>
  );
};

/** Дата и время на двух строках; у каждой строки nowrap — время не разъезжается на третью. */
const periodCellContent = (periodStart, periodStop) => {
  const { dateLine, timeLine } = getPeriodRangeDisplayParts(periodStart, periodStop);
  if (!dateLine && !timeLine) return "—";
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.25, gap: 0.25, minWidth: "max-content" }}>
      {dateLine ? (
        <Box component="span" sx={{ whiteSpace: "nowrap" }}>
          {dateLine}
        </Box>
      ) : null}
      {timeLine ? (
        <Box component="span" sx={{ whiteSpace: "nowrap" }}>
          {timeLine}
        </Box>
      ) : null}
    </Box>
  );
};

const rowStatusBackground = (status) => {
  if (status === MONITORING_STATUS_PARTIALLY_CONFIRMED) return MONITORING_STATUS_PARTIAL_ROW_BG;
  if (status === MONITORING_STATUS_CANCELED) return MONITORING_STATUS_CANCELED_ROW_BG;
  return undefined;
};

const asSortable = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value).trim();
  const numeric = Number(text.replace(",", "."));
  if (text !== "" && Number.isFinite(numeric) && /^-?\d+([.,]\d+)?$/.test(text)) return numeric;
  return text;
};

const compareSortValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), "ru", { numeric: true, sensitivity: "base" });
};

const CLIENT_SORT_ACCESSOR = {
  status: (row) => MONITORING_STATUS_OPTIONS.find((item) => item.value === row?.status)?.label ?? row?.status ?? "",
  areaHa: (row) => asSortable(row?.area),
  equipment: (row) => row?.equipment_name || null,
  widthM: (row) => asSortable(row?.trailer_width),
};

const sortClientRows = (rows, key, order) => {
  const accessor = CLIENT_SORT_ACCESSOR[key];
  if (!accessor) return rows;
  const direction = order === "desc" ? -1 : 1;
  return [...rows].sort((left, right) => direction * compareSortValues(accessor(left), accessor(right)));
};

const columnHeaderContent = (column, sortColumnKey, sortOrder, onColumnSort) => {
  const indicator = sortColumnKey === column.key ? (sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : null) : null;
  return (
    <ButtonBase
      disableRipple
      onClick={() => onColumnSort?.(column.key)}
      sx={{
        width: "100%",
        justifyContent: column.align === "right" ? "flex-end" : "flex-start",
        gap: 0.5,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: 1.2,
        color: "inherit",
        borderRadius: 0.5,
      }}
    >
      {column.label}
      {indicator ? (
        <Box component="span" aria-hidden="true">
          {indicator}
        </Box>
      ) : null}
    </ButtonBase>
  );
};

const visibleGroupTitle = (groupTitle) => {
  if (typeof groupTitle === "string") return groupTitle.trim() || null;
  return groupTitle || null;
};

const MonitoringTable = ({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  isRowSelected,
  onRowCheckedChange,
  sortColumnKey,
  sortOrder,
  clientSortKey,
  onColumnSort,
  groupTitle,
  statusReference = null,
}) => {
  const groupTitleText = visibleGroupTitle(groupTitle);
  const visibleRows = useMemo(
    () => (clientSortKey ? sortClientRows(rows, clientSortKey, sortOrder) : rows),
    [rows, clientSortKey, sortOrder],
  );

  return (
    <Box sx={{ mt: 1 }}>
      <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "#e0e0e0", overflowX: "auto" }}>
        <Table
          size="small"
          sx={{
            tableLayout: "auto",
            width: "100%",
          }}
        >
          {groupTitleText ? (
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={MONITORING_TABLE_COLUMNS.length}
                  sx={{
                    backgroundColor: "#eef6ea",
                    fontWeight: 700,
                    fontSize: 13,
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {groupTitleText}
                </TableCell>
              </TableRow>
            </TableHead>
          ) : null}
          <TableHead>
            <TableRow>
              {MONITORING_TABLE_COLUMNS.map((c) => (
                <TableCell
                  key={c.key}
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap",
                  }}
                  align={c.align || "left"}
                >
                  {columnHeaderContent(c, sortColumnKey, sortOrder, onColumnSort)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {statusReference ? (
              <TableRow>
                <TableCell colSpan={MONITORING_TABLE_COLUMNS.length} sx={{ p: 1.5, borderBottom: "none" }}>
                  {statusReference}
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={MONITORING_TABLE_COLUMNS.length} sx={{ fontSize: 13, color: "#666" }}>
                  Нажмите «ВЫПОЛНИТЬ», чтобы загрузить данные.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => {
                const sourceChangedLabel = formatSourceChangedAt(row.source_changed_at);
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: rowStatusBackground(row.status),
                      "&:hover": {
                        backgroundColor: "rgba(98, 166, 93, 0.08)",
                      },
                    }}
                  >
                    <TableCell sx={{ fontSize: 12 }}>
                      <MonitoringStatusCell
                        status={row.status}
                        checked={Boolean(isRowSelected?.(row.id))}
                        onCheckedChange={(checked) => onRowCheckedChange?.(row.id, checked)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, verticalAlign: "top" }} align="left">
                      {periodCellContent(row.period_start, row.period_stop)}
                      {sourceChangedLabel ? (
                        <Box sx={{ mt: 0.25, fontSize: 11, lineHeight: 1.2, color: "#666", whiteSpace: "nowrap" }}>
                          {`Данные в SMSR изменились ${sourceChangedLabel}`}
                        </Box>
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="left">
                      {displayText(row.field_name)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="right">
                      {displayNum(row.area)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="left">
                      {displayText(row.equipment_name)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="left">
                      {displayText(row.trailer_name)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="right">
                      {displayNum(row.trailer_width)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="left">
                      {displayText(row.tech_operation_name)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="left">
                      {displayText(row.driver_name)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="right">
                      {displayNum(row.area_worked)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align="right">
                      {displayNum(row.mileage)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {total > 0 ? (
        <TablePagination
          component="div"
          count={total}
          page={Math.max(0, page - 1)}
          onPageChange={(_e, nextZeroBased) => onPageChange(nextZeroBased + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value, 10))}
          rowsPerPageOptions={MONITORING_PAGE_SIZE_OPTIONS}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`}
        />
      ) : null}
    </Box>
  );
};

export default MonitoringTable;
