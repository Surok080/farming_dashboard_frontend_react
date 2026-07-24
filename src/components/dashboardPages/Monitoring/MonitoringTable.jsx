import React from "react";
import {
  Box,
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
import { MONITORING_PAGE_SIZE_OPTIONS } from "./monitoringConstants";
import { MONITORING_TABLE_COLUMNS } from "./monitoringColumns";
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
}) => (
  <Box sx={{ mt: 1 }}>
    <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "#e0e0e0", overflowX: "auto" }}>
      <Table
        size="small"
        sx={{
          tableLayout: "auto",
          width: "100%",
        }}
      >
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
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={MONITORING_TABLE_COLUMNS.length} sx={{ fontSize: 13, color: "#666" }}>
                Нажмите «ВЫПОЛНИТЬ», чтобы загрузить данные.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: "pointer",
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
            ))
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

export default MonitoringTable;
