import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => axiosClient.post("/auth/login/", data), // ← correct
  register: (data) => axiosClient.post("/auth/register/", data), // ← correct
  me: () => axiosClient.get("/users/me/"),
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_profile");
  },
};
