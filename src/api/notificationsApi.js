
import axiosClient from "./axiosClient";

export const notificationsApi = {
  // Get user's notifications
  list: (params) => axiosClient.get("/notifications/", { params }),

  // Get single notification
  get: (id) => axiosClient.get(`/notifications/${id}/`),

  // Mark as read
  markRead: (id) => axiosClient.post(`/notifications/${id}/mark-read/`),

  // Mark all as read
  markAllRead: () => axiosClient.post("/notifications/mark-all-read/"),
};
