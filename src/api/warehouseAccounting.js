import { httpService } from "./setup";
import { getApiErrorMessage } from "./externalIntegrations";

export function getWarehouseDictionaries() {
  return httpService.get("/warehouse_accounting/dictionaries");
}

export function getWarehouseMovement(params) {
  return httpService.get("/warehouse_accounting/movement", { params });
}

export function getWarehouseMovementDocuments(params) {
  return httpService.get("/warehouse_accounting/movement/documents", { params });
}

export function getWarehouseSectionsSummary(params) {
  return httpService.get("/warehouse_accounting/sections_summary", { params });
}

export function getWarehouseStockByStorages(params) {
  return httpService.get("/warehouse_accounting/stock_by_storages", { params });
}

/** POST /s3_storage/check → { ok: boolean, detail: string } */
export function checkS3Storage() {
  return httpService.post("/s3_storage/check");
}

export { getApiErrorMessage };
