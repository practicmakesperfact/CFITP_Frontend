// src/api/commentsApi.js
import axiosClient from "./axiosClient.js";

// In-memory mock storage (only for development)
const mockComments = {};

// Fake delay for realistic feel
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const commentsApi = {
  // GET /issues/{id}/comments/
  list: async (issueId) => {
    try {
      const response = await axiosClient.get(`/issues/${issueId}/comments/`);
      return response;
    } catch (error) {
      console.warn("Backend comments failed → using mock", error);
      await delay(300);
      return { data: mockComments[issueId] || [] };
    }
  },

  // POST /issues/{id}/comments/
  create: async (issueId, data) => {
    try {
      const response = await axiosClient.post(
        `/issues/${issueId}/comments/`,
        data
      );
      return response;
    } catch (error) {
      console.warn("Backend create comment failed → using mock", error);
      await delay(800);

      const newComment = {
        id: Date.now(),
        author: localStorage.getItem("user_profile")
          ? JSON.parse(localStorage.getItem("user_profile")).first_name ||
            "User"
          : "Admin",
        content: data.content,
        created_at: new Date().toISOString(),
      };

      if (!mockComments[issueId]) mockComments[issueId] = [];
      mockComments[issueId].push(newComment);

      return { data: newComment };
    }
  },

  // Optional: update & delete (mock only for now)
  update: async (id, data) => {
    await delay(500);
    return { data: { id, ...data } };
  },

  delete: async (id) => {
    await delay(500);
    return { data: { success: true } };
  },
};
