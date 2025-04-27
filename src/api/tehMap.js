import { httpService } from "./setup";


class TehMapService {
	/**
	 * Получение полей
	 */
	getCrops(year,fact){
		return httpService.get(`/tech_map/list?year=${year}`)
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

  	/**
	 * Получение полей
	 */
	getPlanFact(year){
		return httpService.get(`/plan_fact/list?year=${year}`)
	}
}


const TehMapApi = new TehMapService();

export { TehMapApi };
