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
}

const SignInApi = new SignInService();

export { SignInApi };

