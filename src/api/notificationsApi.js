
import axiosClient from "./axiosClient.js";

export const notificationsApi = {
  list: () => axiosClient.get("/notifications/"),
  markRead: (id) => axiosClient.patch(`/notifications/${id}/`, { read: true }),
  markAllRead: () => axiosClient.post("/notifications/mark-all-read/"),
};
