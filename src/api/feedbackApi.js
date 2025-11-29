// import axiosClient from "./axiosClient.js";

// export const feedbackApi = {
//   list: (params) => axiosClient.get("/feedback/", { params }),
//   create: (data) => axiosClient.post("/feedback/", data),
//   convert: (id) => axiosClient.post(`/feedback/${id}/convert/`),
// };


import axiosClient from "./axiosClient";

export const feedbackApi = {
  list: () => axiosClient.get("/feedback/"),
  create: (data) => axiosClient.post("/feedback/", data),
};