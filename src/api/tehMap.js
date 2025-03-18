import { httpService } from "./setup";


class TehMapService {
	/**
	 * Получение полей
	 */
	getCrops(year,fact){
		return httpService.get(`/tech_map/list?year=${year}&fact=${fact}`)
	}

	/**
	 * Получение операций
	 */
	getOperation(){
		return httpService.get(`/api_smsr/list`)
	}

	/**
	 * Получение отчета по id операции
	 */
	getReports(idOperation){
		return httpService.get(`/api_smsr?tech_cultivation_id=${idOperation}`)
	}

  	/**
	 * Получение полей
	 */
	getDataCrop(year,fact, crop, tech = 0){
		return httpService.get(`/tech_map?culture=${crop}&year=${year}&fact=${fact}&tech_cultivation=${tech}`)
	}

	async getListObject() {
		try {
			const response = await httpService.get('https://smsr.online/api/integration/v1/getobjectslist?companyId=114');  // TODO Это как будто тоже самое что и я делаю?
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
