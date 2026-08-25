import React from "react";
import {
  Box,
  IconButton,
  Paper,
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
  formatAmount,
  formatQuantity,
  formatSignedQuantity,
  hasMovement,
} from "./warehouseAccountingUtils";

const headCell = {
  fontWeight: 600,
  fontSize: 11,
  color: "#8a93a0",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e7edf3",
  backgroundColor: "#fff",
  padding: "10px 12px",
  verticalAlign: "middle",
  top: 0,
  zIndex: 3,
};

const bodyCellBase = {
  fontSize: 13,
  color: "#3b4350",
  borderBottom: "1px solid #eef2f6",
  padding: "10px 12px",
  verticalAlign: "middle",
};

const openingHeadSx = {
  ...headCell,
  backgroundColor: "#f3f5f8",
  borderBottom: "1px solid #dfe4ea",
};

const openingBodySx = {
  ...bodyCellBase,
  backgroundColor: "#f3f5f8",
};

const closingHeadSx = {
  ...headCell,
  backgroundColor: "#edf8e8",
  borderBottom: "1px solid #d7ebd0",
};

const closingBodySx = {
  ...bodyCellBase,
  backgroundColor: "#edf8e8",
};

const balanceHeadLabel = (text) => (
  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#8a93a0", lineHeight: 1.25 }}>{text}</Typography>
);

const MovementCell = ({ value, unit, sign, color, showInfo, onInfoClick }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-start" }}>
    <Typography sx={{ fontSize: 13, fontWeight: 600, color, whiteSpace: "nowrap" }}>
      {formatSignedQuantity(value, unit, sign)}
    </Typography>
    {showInfo ? (
      <IconButton size="small" onClick={onInfoClick} sx={{ color: "#9aa3af", p: 0.25 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    ) : null}
  </Box>
);

const WarehouseAccountingTable = ({
  rows = [],
  loading,
  filtersActive,
  onOpenDocuments,
}) => {
  const emptyMessage = filtersActive ? EMPTY_FILTERS_MESSAGE : EMPTY_PERIOD_MESSAGE;
  const colCount = 9;

  return (
    <Box
      sx={{
        mt: 1.5,
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          maxHeight: "100%",
          borderColor: "#e6ecf2",
          borderRadius: "10px",
          overflow: "auto",
          boxShadow: "none",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headCell}>Наименование</TableCell>
              <TableCell sx={headCell}>Склад</TableCell>
              <TableCell sx={openingHeadSx}>{balanceHeadLabel("Остаток на начало")}</TableCell>
              <TableCell sx={{ ...openingHeadSx, borderLeft: "1px solid #dfe4ea" }}>
                {balanceHeadLabel("Сумма, руб")}
              </TableCell>
              <TableCell sx={headCell}>Приход</TableCell>
              <TableCell sx={headCell}>Средняя цена</TableCell>
              <TableCell sx={headCell}>Расход</TableCell>
              <TableCell sx={closingHeadSx}>{balanceHeadLabel("Остаток на конец")}</TableCell>
              <TableCell sx={{ ...closingHeadSx, borderLeft: "1px solid #d7ebd0" }}>
                {balanceHeadLabel("Сумма, руб")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} sx={{ ...bodyCellBase, color: "#666" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const hasIncome = hasMovement(row.income_quantity, row.income_amount);
                const hasExpense = hasMovement(row.expense_quantity, row.expense_amount);
                return (
                  <TableRow key={`${row.product_id}-${row.storage_id}-${row.section_id}`}>
                    <TableCell sx={{ ...bodyCellBase, minWidth: 135 }}>{row.product_name}</TableCell>
                    <TableCell sx={{ ...bodyCellBase, minWidth: 110 }}>{row.storage_name}</TableCell>
                    <TableCell sx={openingBodySx}>{formatQuantity(row.opening_quantity, row.unit)}</TableCell>
                    <TableCell sx={{ ...openingBodySx, borderLeft: "1px solid #e4e8ee" }}>
                      {formatAmount(row.opening_amount)}
                    </TableCell>
                    <TableCell sx={bodyCellBase}>
                      <MovementCell
                        value={row.income_quantity}
                        unit={row.unit}
                        sign="+"
                        color="#5cb85c"
                        showInfo={hasIncome}
                        onInfoClick={() =>
                          onOpenDocuments({
                            storage_id: row.storage_id,
                            product_id: row.product_id,
                            product_name: row.product_name,
                            storage_name: row.storage_name,
                            income: true,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell sx={bodyCellBase}>
                      {row.avg_price === null || row.avg_price === undefined ? "—" : formatAmount(row.avg_price)}
                    </TableCell>
                    <TableCell sx={bodyCellBase}>
                      <MovementCell
                        value={row.expense_quantity}
                        unit={row.unit}
                        sign="-"
                        color="#e57373"
                        showInfo={hasExpense}
                        onInfoClick={() =>
                          onOpenDocuments({
                            storage_id: row.storage_id,
                            product_id: row.product_id,
                            product_name: row.product_name,
                            storage_name: row.storage_name,
                            income: false,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell sx={closingBodySx}>{formatQuantity(row.closing_quantity, row.unit)}</TableCell>
                    <TableCell sx={{ ...closingBodySx, borderLeft: "1px solid #dcefd6", fontWeight: 600 }}>
                      {formatAmount(row.closing_amount)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WarehouseAccountingTable;
