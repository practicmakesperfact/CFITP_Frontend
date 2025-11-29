
import axiosClient from "./axiosClient.js";

export const reportsApi = {
  request: (data) => axiosClient.post("/reports/", data),
  get: (id) => axiosClient.get(`/reports/${id}/`),
  download: (id) =>
    axiosClient.get(`/reports/${id}/download/`, { responseType: "blob" }),
};
