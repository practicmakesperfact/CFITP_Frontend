import axios from "axios";
import {
  getRefreshToken,
  removeTokens,
  setTokens,
} from "../utils/authHelper.js";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );
        const { access } = res.data;
        setTokens(access, refreshToken);
        axiosClient.defaults.headers.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        processQueue(null, access);
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        removeTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
