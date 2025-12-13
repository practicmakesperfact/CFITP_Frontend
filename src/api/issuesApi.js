import axiosClient from "./axiosClient";

export const issuesApi = {
  // For paginated lists (IssuesPage)
  list: async (params = {}) => {
    const response = await axiosClient.get("/issues/", { params });
    return response.data;
  },

  // For dashboards that need ALL data
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
  update: (id, data) => axiosClient.patch(`/issues/${id}/`, data),
  delete: (id) => axiosClient.delete(`/issues/${id}/`),
  assign: (id, data) => axiosClient.post(`/issues/${id}/assign/`, data),

  transition: (id, status) =>
    axiosClient.post(`/issues/${id}/transition/`, { new_status: status }),
};
