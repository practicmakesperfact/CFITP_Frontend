import axiosClient from "./axiosClient.js";

export const notificationsApi = {
  list: () => axiosClient.get("/notifications/"),
  markRead: (id) => axiosClient.post(`/notifications/${id}/mark-read/`),
};
