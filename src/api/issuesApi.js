import axiosClient from "./axiosClient";

export const issuesApi = {
  list: async (params = {}) => {
    const response = await axiosClient.get("/issues/", { params });
    return response.data;
  },

  listAll: async () => {
    let allResults = [];
    let nextUrl = "/issues/";

    while (nextUrl) {
      const response = await axiosClient.get(nextUrl);
      const data = response.data;
      allResults = [...allResults, ...data.results];
      nextUrl = data.next;
    }

    return { results: allResults, count: allResults.length };
  },

  retrieve: (id) => axiosClient.get(`/issues/${id}/`),
  create: (data) => axiosClient.post("/issues/", data),

  // Updated update method with better error handling
  update: async (id, data) => {
    try {
      const response = await axiosClient.patch(`/issues/${id}/`, data);
      return response;
    } catch (error) {
      console.error("Update error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
    }
  },

  delete: (id) => axiosClient.delete(`/issues/${id}/`),
  assign: (id, data) => axiosClient.post(`/issues/${id}/assign/`, data),

  transition: (id, status) =>
    axiosClient.post(`/issues/${id}/transition/`, { new_status: status }),
};
