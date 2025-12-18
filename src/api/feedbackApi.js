
import axiosClient from "./axiosClient";

export const feedbackApi = {
  // Get all feedback (for staff/manager/admin)
  list: (params) => axiosClient.get("/feedback/", { params }),

  // Get current user's feedback
  my: () => axiosClient.get("/feedback/my/"),

  // Create new feedback (anonymous allowed)
  create: (data) => axiosClient.post("/feedback/", data),

  // Get single feedback
  get: (id) => axiosClient.get(`/feedback/${id}/`),

  // Update feedback (staff/manager/admin only)
  update: (id, data) => axiosClient.patch(`/feedback/${id}/`, data),

  // Convert feedback to issue
  convert: (id, issueData) =>
    axiosClient.post(`/feedback/${id}/convert/`, issueData),

  // Acknowledge feedback
  acknowledge: (id) => axiosClient.post(`/feedback/${id}/acknowledge/`),
};
