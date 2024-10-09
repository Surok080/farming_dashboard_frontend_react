import { httpService } from "./setup";


class TehMapService {
	/**
	 * Получение полей
	 */
	getCrops(year,fact){
		return httpService.get(`/tech_map/list_crop?year=${year}&fact=${fact}`)
	}

  	/**
	 * Получение полей
	 */
	getDataCrop(year,fact, crop, tech = 0){
		return httpService.get(`/tech_map?culture=${crop}&year=${year}&fact=${fact}&tech_cultivation=${tech}`)
	}

	async getListObject() {
		try {
			const response = await httpService.get('https://smsr.online/api/integration/v1/getobjectslist?companyId=114');
			if (!response.status.toString().startsWith('2')) {
				throw new Error(`Ошибка получения списка объектов: ${response.status} ${response.statusText}`);
			}
			console.log('Список объектов получен:', response.data);
			return response.data;
		} catch (error) {
			console.error('Ошибка при получении списка объектов:', error);
			throw error;
		}
	}

}


const TehMapApi = new TehMapService();

export { TehMapApi };
