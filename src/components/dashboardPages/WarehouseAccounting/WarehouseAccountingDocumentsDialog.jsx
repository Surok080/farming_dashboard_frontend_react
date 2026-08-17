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
