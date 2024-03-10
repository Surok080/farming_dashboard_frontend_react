import axios from "axios";

export const httpService = axios.create({
	baseURL: process.env.NODE_ENV === "development" ? 'http://127.0.0.1:8000' : `https://xn--80acqgarss0k.online/`,
	headers: {
		accept: 'application/json',
    "Content-Type": "application/json"
	},
})

const authInterceptor = (config) => {

  if (localStorage.getItem('access_token')) {
    config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`
  }
	return config;
}

httpService.interceptors.request.use(authInterceptor,
	error => {
		Promise.reject(error)
	})

  httpService.interceptors.response.use((response) => {
		return response
	},
	async (error) => {
		if (error?.response?.status === 401) {
      console.log('401', error);
      window.location.href = '/'
		}
    return error.response
	});
