import axiosClient from "./axiosClient";

export const issuesApi = {
  list: async (params = {}) => {
    const response = await axiosClient.get("/issues/", { params });
    console.log("Raw API response:", response);

    // Return the full paginated response
    return response.data;
  },

 //method to fetch all pages (optional but recommended)
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
  assign: (id, data) => axiosClient.post(`/issues/${id}/assign/`, data),
  transition: (id, status) =>
    axiosClient.post(`/issues/${id}/transition/`, { status }),
};
