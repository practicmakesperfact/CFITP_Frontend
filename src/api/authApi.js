import axiosClient from "./axiosClient.js";
import { setTokens, removeTokens } from "../utils/authHelper.js";

export const authApi = {
  register: (data) => axiosClient.post("/auth/register/", data),
  login: async (credentials) => {
    const res = await axiosClient.post("/auth/login/", credentials);
    const { access, refresh } = res.data;
    setTokens(access, refresh);
    return res;
  },
  logout: () => {
    removeTokens();
    window.location.href = "/login";
  },
  me: () => axiosClient.get("/users/me/"),
  refreshToken: (refresh) => axiosClient.post("/auth/refresh/", { refresh }),
};
