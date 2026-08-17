import React, { useEffect, useMemo, useState } from "react";
import { Box, LinearProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  getApiErrorMessage,
  getWarehouseDictionaries,
  getWarehouseMovement,
  getWarehouseSectionsSummary,
  getWarehouseStockByStorages,
} from "../../../api/warehouseAccounting";
import {
  aggregateStockFromMovement,
  filterMovementRows,
  getDefaultWarehouseInterval,
  hasClientFilters,
  toApiDate,
  toggleId,
} from "./warehouseAccountingUtils";
import WarehouseAccountingHeader from "./WarehouseAccountingHeader";
import WarehouseAccountingToolbar from "./WarehouseAccountingToolbar";
import WarehouseAccountingSectionCards from "./WarehouseAccountingSectionCards";
import WarehouseAccountingTable from "./WarehouseAccountingTable";
import WarehouseAccountingChart from "./WarehouseAccountingChart";
import WarehouseAccountingDocumentsDialog from "./WarehouseAccountingDocumentsDialog";

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
  const [documentsQuery, setDocumentsQuery] = useState(null);

  useEffect(() => {
    const date_from = toApiDate(dateFrom);
    const date_to = toApiDate(dateTo);
    if (!date_from || !date_to) return undefined;

    let cancelled = false;
    const loadPeriod = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          getWarehouseDictionaries(),
          getWarehouseMovement({ date_from, date_to }),
          getWarehouseSectionsSummary({ date_from, date_to }),
          getWarehouseStockByStorages({ date_to }),
        ]);
        if (cancelled) return;
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadPeriod();
    return () => {
      cancelled = true;
    };
  }, [dateFrom, dateTo, enqueueSnackbar]);

  const filteredRows = useMemo(
    () => filterMovementRows(movement.rows, { storageIds, sectionIds, productIds }),
    [movement.rows, storageIds, sectionIds, productIds]
  );
  const filtersActive = hasClientFilters({ storageIds, sectionIds, productIds });
  const chartStock = useMemo(() => {
    if (!filtersActive) return stockByStorages;
    return aggregateStockFromMovement(filteredRows);
  }, [filtersActive, stockByStorages, filteredRows]);

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
      <WarehouseAccountingSectionCards
        items={sectionsSummary}
        selectedIds={sectionIds}
        onToggle={(id) => setSectionIds((prev) => toggleId(prev, id))}
      />
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
        <WarehouseAccountingChart stock={chartStock} loading={loading} />
      </Box>
      <WarehouseAccountingDocumentsDialog
        open={Boolean(documentsQuery)}
        query={documentsQuery}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onClose={() => setDocumentsQuery(null)}
      />
    </Box>
  );
};

export default WarehouseAccountingPage;
