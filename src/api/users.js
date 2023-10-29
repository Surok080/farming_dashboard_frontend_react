import { httpService } from "./setup";


class UsersService {
	/**
	 * Создание пользователя
	 */
	addUser(data){
		return httpService.post('/auth/users', data)
	}

	/**
	 * Удаление пользователя
	 */
	deleteUser(userId){
		return httpService.delete(`/auth/user_delete/${userId}`)
	}

	/**
	 * Получение пользователя по id 
	 */
	getUserToId(userId){
		return httpService.get(`/auth/users/${userId}`)
	}

	/**
	 * Изменение пользователя по id 
	 */
	editUserToId(userId, data){
		return httpService.patch(`/auth/user_update/${userId}`, data)
	}

	/**
	 * Получение пермишенов 
	 */
	getPermission(){
		return httpService.get(`/auth/permissions`)
	}

}


const UsersApi = new UsersService();

export { UsersApi };
