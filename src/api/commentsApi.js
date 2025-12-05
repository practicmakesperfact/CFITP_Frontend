import axiosClient from "./axiosClient";

export const commentsApi = {
  // GET: List comments for an issue
  list: (issueId) => {
    return axiosClient.get(`/issues/${issueId}/comments/`);
  },

  // POST: Create a comment for an issue (FIXED - removed /create/)
  create: (issueId, data) => {
    return axiosClient.post(`/issues/${issueId}/comments/`, {
      content: data.content,
      visibility: data.visibility || "public",
    });
  },

  update:  (id, data) => axiosClient.patch(`/comments/${id}/`, data),
  delete: (id) => axiosClient.delete(`/comments/${id}/`),
  retrieve: (id) => axiosClient.get(`/comments/${id}/`),
};
