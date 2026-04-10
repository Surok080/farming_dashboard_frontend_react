/**
 * Нормализация id строки мониторинга для сравнения и хранения выбора.
 * Числовые id приводим к number, иначе оставляем строку (на случай нечисловых ключей).
 */
export function normalizeMonitoringRowId(id) {
  if (id === null || id === undefined || id === "") return null;
  const n = Number(id);
  if (Number.isFinite(n)) return n;
  return String(id);
}

export function monitoringRowIdsEqual(a, b) {
  const na = normalizeMonitoringRowId(a);
  const nb = normalizeMonitoringRowId(b);
  if (na === null || nb === null) return false;
  return na === nb;
}
