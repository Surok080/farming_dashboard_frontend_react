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
