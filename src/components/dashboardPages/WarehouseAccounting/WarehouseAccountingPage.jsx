import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import WarehouseAccountingToolbar, { WarehouseAccountingRunBar } from "./WarehouseAccountingToolbar";
import WarehouseAccountingSectionCards from "./WarehouseAccountingSectionCards";
import WarehouseAccountingTable from "./WarehouseAccountingTable";
import WarehouseAccountingChart from "./WarehouseAccountingChart";
import WarehouseAccountingDocumentsDialog from "./WarehouseAccountingDocumentsDialog";

const asArray = (value) => (Array.isArray(value) ? value : []);

const WarehouseAccountingPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const enqueueSnackbarRef = useRef(enqueueSnackbar);
  enqueueSnackbarRef.current = enqueueSnackbar;
  const loadSeqRef = useRef(0);

  const defaults = getDefaultWarehouseInterval();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [appliedDateFrom, setAppliedDateFrom] = useState(defaults.from);
  const [appliedDateTo, setAppliedDateTo] = useState(defaults.to);
  const [storageIds, setStorageIds] = useState([]);
  const [sectionIds, setSectionIds] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [dictionaries, setDictionaries] = useState({ products: [], storages: [], sections: [] });
  const [movement, setMovement] = useState({ rows: [], last_operation_date: null });
  const [sectionsSummary, setSectionsSummary] = useState([]);
  const [stockByStorages, setStockByStorages] = useState({ storages: [], total_amount: 0, date: null });
  const [loading, setLoading] = useState(true);
  const [documentsQuery, setDocumentsQuery] = useState(null);

  const loadPeriod = useCallback(async (fromValue, toValue) => {
    const date_from = toApiDate(fromValue);
    const date_to = toApiDate(toValue);
    if (!date_from || !date_to) {
      enqueueSnackbarRef.current("Укажите корректный период", { variant: "warning" });
      return;
    }

    const seq = ++loadSeqRef.current;
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getWarehouseDictionaries(),
        getWarehouseMovement({ date_from, date_to }),
        getWarehouseSectionsSummary({ date_from, date_to }),
        getWarehouseStockByStorages({ date_to }),
      ]);
      if (seq !== loadSeqRef.current) return;

      const labels = [
        "Не удалось загрузить справочники",
        "Не удалось загрузить движение ТМЦ",
        "Не удалось загрузить сводку по разделам",
        "Не удалось загрузить остатки по складам",
      ];
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          enqueueSnackbarRef.current(getApiErrorMessage(result.reason, labels[index]), { variant: "error" });
        }
      });
      if (results[0].status === "fulfilled") {
        const data = results[0].value?.data ?? {};
        setDictionaries({
          products: asArray(data.products),
          storages: asArray(data.storages),
          sections: asArray(data.sections),
        });
      }
      if (results[1].status === "fulfilled") {
        const data = results[1].value?.data ?? {};
        setMovement({
          rows: asArray(data.rows),
          last_operation_date: data.last_operation_date ?? null,
        });
      }
      if (results[2].status === "fulfilled") {
        setSectionsSummary(asArray(results[2].value?.data));
      }
      if (results[3].status === "fulfilled") {
        const data = results[3].value?.data ?? {};
        setStockByStorages({
          storages: asArray(data.storages),
          total_amount: data.total_amount ?? 0,
          date: data.date ?? null,
        });
      }
      setAppliedDateFrom(fromValue);
      setAppliedDateTo(toValue);
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPeriod(defaults.from, defaults.to);
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: "#f7f9fc",
        p: 1.5,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "stretch",
          flex: 1,
          minHeight: 0,
          flexWrap: { xs: "wrap", lg: "nowrap" },
          overflow: { xs: "auto", lg: "hidden" },
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            border: "1px solid #e6ecf2",
            borderRadius: "10px",
            p: 1.5,
            overflow: "hidden",
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <WarehouseAccountingHeader />
            <WarehouseAccountingToolbar
              storages={dictionaries.storages}
              sections={dictionaries.sections}
              storageIds={storageIds}
              sectionIds={sectionIds}
              onStorageIdsChange={setStorageIds}
              onSectionIdsChange={setSectionIds}
              clearDisabled={!filtersActive}
              onClearSelection={() => {
                setStorageIds([]);
                setSectionIds([]);
                setProductIds([]);
              }}
            />
            {loading ? <LinearProgress sx={{ mt: 1.5 }} /> : null}
            <WarehouseAccountingSectionCards
              items={sectionsSummary}
              selectedIds={sectionIds}
              onToggle={(id) => setSectionIds((prev) => toggleId(prev, id))}
            />
            <WarehouseAccountingRunBar
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              products={dictionaries.products}
              productIds={productIds}
              onProductIdsChange={setProductIds}
              lastOperationDate={movement.last_operation_date}
              runLoading={loading}
              onRun={() => loadPeriod(dateFrom, dateTo)}
            />
          </Box>
          <WarehouseAccountingTable
            rows={filteredRows}
            loading={loading}
            filtersActive={filtersActive}
            onOpenDocuments={setDocumentsQuery}
          />
        </Box>
        <Box
          sx={{
            width: { xs: "100%", lg: 320 },
            minWidth: 0,
            minHeight: { xs: "auto", lg: 0 },
            height: { xs: "auto", lg: "100%" },
            display: "flex",
            flexDirection: "column",
            alignSelf: "stretch",
            overflow: "hidden",
          }}
        >
          <WarehouseAccountingChart stock={chartStock} loading={loading} />
        </Box>
      </Box>
      <WarehouseAccountingDocumentsDialog
        open={Boolean(documentsQuery)}
        query={documentsQuery}
        dateFrom={appliedDateFrom}
        dateTo={appliedDateTo}
        onClose={() => setDocumentsQuery(null)}
      />
    </Box>
  );
};

export default WarehouseAccountingPage;
