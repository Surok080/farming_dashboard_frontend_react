import { useCallback, useState } from "react";
import { monitoringRowIdsEqual, normalizeMonitoringRowId } from "./monitoringIdUtils";

/**
 * Выбор строк таблицы мониторинга по id с нормализацией (число / строка).
 */
export function useMonitoringRowSelection() {
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const handleRowCheckedChange = useCallback((rowId, checked) => {
    const id = normalizeMonitoringRowId(rowId);
    if (id == null) return;
    setSelectedRowIds((prev) => {
      const has = prev.some((p) => monitoringRowIdsEqual(p, id));
      if (checked) {
        if (has) return prev;
        return [...prev, id];
      }
      return prev.filter((p) => !monitoringRowIdsEqual(p, id));
    });
  }, []);

  /** Убрать из выбора id, которых нет в текущем списке строк */
  const pruneInvalidIds = useCallback((items) => {
    const valid = new Set(
      items.map((item) => normalizeMonitoringRowId(item.id)).filter((x) => x != null)
    );
    setSelectedRowIds((prev) => prev.filter((p) => valid.has(normalizeMonitoringRowId(p))));
  }, []);

  const isRowSelected = useCallback(
    (rowId) => selectedRowIds.some((sid) => monitoringRowIdsEqual(sid, rowId)),
    [selectedRowIds]
  );

  return {
    selectedRowIds,
    setSelectedRowIds,
    handleRowCheckedChange,
    pruneInvalidIds,
    isRowSelected,
  };
}
