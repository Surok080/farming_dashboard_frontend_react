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
        // Сохраняем оба токена
        if (res?.data?.access_token) {
          localStorage.setItem("access_token", res.data.access_token);
        }
        if (res?.data?.refresh_token) {
          localStorage.setItem("refresh_token", res.data.refresh_token);
        }
        return res;
      })
  }

  /**
   * Обновление токена
   */
  refreshToken() {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    return httpService.post("/auth/refresh", { refresh_token: refreshTokenValue })
      .then(response => {
        if (response?.data?.access_token) {
          localStorage.setItem("access_token", response.data.access_token);
        }
        
        // Если сервер вернул новый refresh токен, обновляем его
        if (response?.data?.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        
        return response;
      })
      .catch((error) => {
        // Если не удалось обновить токен, очищаем localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw error;
      });
  }

  /**
   * Выход из системы
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  }

  getMe() {
    return httpService.get("/auth/get_me")
      .then(response => {
        if (response?.status !== 200) {
          throw new Error(`Ошибка: ${response.statusText}`);
        }
        return response;
      })
      .catch((error) => {
        throw new Error(`Ошибка: ${error}`);
      });
  }
}

const SignInApi = new SignInService();

export { SignInApi };

