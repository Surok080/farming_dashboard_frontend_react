import { httpService } from "./setup";
import { getApiErrorMessage } from "./externalIntegrations";

/**
 * GET /notifications/channels
 */
export function getNotificationChannels() {
  return httpService.get("/notifications/channels");
}

/**
 * POST /notifications/channels/max/generate-code
 */
export function generateMaxConnectionCode() {
  return httpService.post("/notifications/channels/max/generate-code");
}

/**
 * DELETE /notifications/channels/{channelId}
 */
export function deleteNotificationChannel(channelId) {
  return httpService.delete(`/notifications/channels/${channelId}`);
}

/**
 * GET /notifications/auto-report/settings
 */
export function getAutoReportSettings() {
  return httpService.get("/notifications/auto-report/settings");
}

/**
 * POST /notifications/auto-report/settings
 */
export function postAutoReportSettings(payload) {
  return httpService.post("/notifications/auto-report/settings", payload);
}

export { getApiErrorMessage };
