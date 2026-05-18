import { httpService } from "./setup";

/**
 * GET /external_integrations/services
 */
export function getExternalServices() {
  return httpService.get("/external_integrations/services");
}

/**
 * GET /external_integrations
 */
export function getMyExternalIntegrations() {
  return httpService.get("/external_integrations");
}

/**
 * GET /external_integrations/{serviceCode}
 */
export function getMyExternalIntegration(serviceCode) {
  return httpService.get(`/external_integrations/${serviceCode}`);
}

/**
 * POST /external_integrations/{serviceCode}
 * @param {string} serviceCode — SMSR | GLONASSSOFT
 * @param {{ login: string, password: string, params?: object }} payload
 */
export function connectExternalIntegration(serviceCode, payload) {
  return httpService.post(`/external_integrations/${serviceCode}`, payload);
}

/**
 * DELETE /external_integrations/{serviceCode}
 */
export function deleteExternalIntegration(serviceCode) {
  return httpService.delete(`/external_integrations/${serviceCode}`);
}

export function getApiErrorMessage(error, fallback = "Произошла ошибка") {
  const detail = error?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).join(". ");
  }
  return fallback;
}
