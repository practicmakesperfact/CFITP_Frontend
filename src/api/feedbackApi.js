import axiosClient from "./axiosClient.js";

export const feedbackApi = {
  list: (params) => axiosClient.get("/feedback/", { params }),
  create: (data) => axiosClient.post("/feedback/", data),
  convert: (id) => axiosClient.post(`/feedback/${id}/convert/`),
};
