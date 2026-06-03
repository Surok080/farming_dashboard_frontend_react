import { httpService } from "./setup";
import { getApiErrorMessage } from "./externalIntegrations";

/**
 * GET /monitoring
 * @param {Record<string, string|number|undefined>} params — start, stop, status_value?, page, page_size, sort_by, sort_order
 */
export function getMonitoring(params) {
  return httpService.get("/monitoring", { params });
}

/**
 * GET /monitoring/{row_id}
 */
export function getMonitoringById(rowId) {
  return httpService.get(`/monitoring/${rowId}`);
}

/**
 * PATCH /monitoring/{row_id}
 */
export function patchMonitoringRow(rowId, payload) {
  return httpService.patch(`/monitoring/${rowId}`, payload);
}

/**
 * POST /monitoring/{row_id}/status
 */
export function postMonitoringStatus(rowId, status) {
  return httpService.post(`/monitoring/${rowId}/status`, { status });
}

/**
 * POST /monitoring/merge
 */
export function postMonitoringMerge(rowIds) {
  return httpService.post("/monitoring/merge", { row_ids: rowIds });
}

/**
 * POST /monitoring/send-to-chat
 */
export function postMonitoringSendToChat(rowIds, providers = null) {
  return httpService.post("/monitoring/send-to-chat", {
    row_ids: rowIds,
    providers,
  });
}

/**
 * POST /monitoring/download — скачать данные за вчера (фоновая задача)
 */
export function postMonitoringDownloadYesterday() {
  return httpService.post("/monitoring/download");
}

/**
 * GET /monitoring/download/auto — статус автоскачивания
 */
export function getMonitoringAutoDownloadStatus() {
  return httpService.get("/monitoring/download/auto");
}

/**
 * POST /monitoring/download/auto — включить / выключить автоскачивание
 */
export function toggleMonitoringAutoDownload() {
  return httpService.post("/monitoring/download/auto");
}

export { getApiErrorMessage };
