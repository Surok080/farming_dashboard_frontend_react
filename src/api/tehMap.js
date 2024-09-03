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
	getDataCrop(year,fact, crop){
		return httpService.get(`/tech_map?culture=${crop}&year=${year}&fact=${fact}`)
	}

}


const TehMapApi = new TehMapService();

export { TehMapApi };
