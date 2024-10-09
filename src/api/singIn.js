import { httpService } from "./setup";

class SignInService {
  /**
   * Авторизация пользователя
   */
  auth(data) {
    return httpService
      .post("/auth/token", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((res) => {
        // try {
          localStorage.setItem("access_token", res?.data?.access_token);
        // } catch (error) {
        //   window.location.href = '/'
        // }
        return res;
      })
  }

  getMe() {
    return httpService.get("/auth/get_me/")
      .then(response => {
        if (response?.status !== 200) {
          console.log(response, '---!response.status && response.status !== 200');
          throw new Error(`Ошибка: ${response.statusText}`);
        }
        return response;
      })
      .catch((error) => {
        console.log(response, '---catch((error) => {');
        throw new Error(`Ошибка: ${error}`);
      });
  }

    async getSessionToken() {
        try {
            const response = await httpService.get('https://smsr.online/api/integration/v1/connect?login=bir&password=542297&lang=ru-ru',);
            if (!response.status.toString().startsWith('2')) {
                throw new Error(`Ошибка получения токена: ${response.status} ${response.statusText}`);
            }
            console.log('Токен получен:', response.data); // Проверьте, что токен действительно пришел
            return response; // Возвращаем весь ответ, а не только данные
        } catch (error) {
            console.error('Ошибка при получении токена:', error);
            throw error; // Перебрасываем ошибку для обработки выше по цепочке
        }
    }
}

const SignInApi = new SignInService();

export { SignInApi };

