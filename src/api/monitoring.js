import { httpService } from "./setup";

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
 * @param {number|string} rowId
 * @param {{driver_id:number|null, tech_operation_id:number|null, trailer_id:number|null}} payload
 */
export function patchMonitoringRow(rowId, payload) {
  return httpService.patch(`/monitoring/${rowId}`, payload);
}

/**
 * POST /monitoring/{row_id}/status
 * @param {number|string} rowId
 * @param {string} status
 */
export function postMonitoringStatus(rowId, status) {
  return httpService.post(`/monitoring/${rowId}/status`, { status });
}

/**
 * POST /monitoring/merge
 * @param {Array<number|string>} rowIds
 */
export function postMonitoringMerge(rowIds) {
  return httpService.post("/monitoring/merge", { row_ids: rowIds });
}
