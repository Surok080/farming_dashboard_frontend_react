import axios from "axios";

export const httpService = axios.create({
	// baseURL: process.env.NODE_ENV === "development" ? 'https://agro-connect.ru/' : `https://agro-connect.ru/`,
	baseURL: process.env.NODE_ENV === "development" ? 'http://127.0.0.1:8000/' : `https://agro-connect.ru/`,
	withCredentials: true,
	headers: {
		accept: 'application/json',
	},
})

const authInterceptor = (config) => {
  if (localStorage.getItem('access_token')) {
    config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`
  }
	return config;
}

// Функция для обновления токена
const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${process.env.NODE_ENV === "development" ? 'http://127.0.0.1:8000/' : 'https://agro-connect.ru/'}auth/refresh`,
      { refresh_token: refreshTokenValue },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      
      // Если сервер вернул новый refresh токен, обновляем его
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      return response.data.access_token;
    }
    throw new Error('No access token in response');
  } catch (error) {
    // Если не удалось обновить токен, очищаем localStorage и перенаправляем на главную
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
    throw error;
  }
};

httpService.interceptors.request.use(authInterceptor,
	error => {
		Promise.reject(error)
	})

// Переменная для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

httpService.interceptors.response.use((response) => {
		return response
	},
	async (error) => {
		const originalRequest = error.config;

		if (error?.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				// Если уже идет процесс обновления токена, добавляем запрос в очередь
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then(token => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return httpService(originalRequest);
				}).catch(err => {
					return Promise.reject(err);
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const newToken = await refreshToken();
				processQueue(null, newToken);
				
				// Повторяем оригинальный запрос с новым токеном
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return httpService(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				// Если не удалось обновить токен, перенаправляем на главную
				window.location.href = '/';
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
		
		return Promise.reject(error);
	});
