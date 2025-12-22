
import axiosClient from "./axiosClient";

export const issueHistoryApi = {
  // Get all issue history
  listAll: async (params = {}) => {
    const response = await axiosClient.get("/issue-history/", { params });
    return response.data;
  },

  // Get history for a specific issue
  getByIssue: async (issueId) => {
    const response = await axiosClient.get(`/issues/${issueId}/history/`);
    return response.data;
  },

  // Get history by user
  getByUser: async (userId) => {
    const response = await axiosClient.get(
      `/issue-history/?changed_by=${userId}`
    );
    return response.data;
  },

  // Get recent history (last 7 days)
  getRecent: async () => {
    const response = await axiosClient.get("/issue-history/recent/");
    return response.data;
  },

  // Search history
  search: async (query) => {
    const response = await axiosClient.get(`/issue-history/?search=${query}`);
    return response.data;
  },
};
