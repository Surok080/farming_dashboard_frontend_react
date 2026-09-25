import { httpService } from "./setup";
import { getApiErrorMessage } from "./externalIntegrations";

/** GET /campaigns — список кампаний со строками выполнения */
export function getCampaigns() {
  return httpService.get("/campaigns");
}

/** GET /campaigns/dicts — операции, поля и техника для формы создания */
export function getCampaignDicts() {
  return httpService.get("/campaigns/dicts");
}

/**
 * POST /campaigns
 * @param {{
 *   name: string,
 *   tech_operation_id: number,
 *   date_start: string,
 *   date_stop: string,
 *   field_ids: number[],
 *   equipment_ids: number[],
 * }} payload даты в формате DD-MM-YYYY
 */
export function createCampaign(payload) {
  return httpService.post("/campaigns", payload);
}

/** DELETE /campaigns/{id} */
export function deleteCampaign(campaignId) {
  return httpService.delete(`/campaigns/${campaignId}`);
}

/** GET /campaigns/triggers */
export function getCampaignTriggers() {
  return httpService.get("/campaigns/triggers");
}

/**
 * POST /campaigns/triggers
 * @param {{ threshold_60: boolean, threshold_80: boolean, threshold_90: boolean }} payload
 */
export function saveCampaignTriggers(payload) {
  return httpService.post("/campaigns/triggers", payload);
}

export { getApiErrorMessage };
