
// import mockIssues from "./mockIssues.js";

// /**
//  * issuesApi is a tiny adapter that returns objects shaped like axios responses
//  * (i.e., { data: ... }), which keeps the rest of your code (useQuery, etc.) unchanged.
//  */

// export const issuesApi = {
//   list: async (params = {}) => {
//     return await mockIssues.list(params);
//   },
//   create: async (payload) => {
//     return await mockIssues.create(payload);
//   },
//   retrieve: async (id) => {
//     return await mockIssues.retrieve(id);
//   },
//   update: async (id, payload) => {
//     return await mockIssues.update(id, payload);
//   },
//   assign: async (id, assignee) => {
//     return await mockIssues.assign(id, assignee);
//   },
//   transition: async (id, status) => {
//     return await mockIssues.transition(id, status);
//   },
//   delete: async (id) => {
//     return await mockIssues.delete(id);
//   },

//   // attachments
//   uploadAttachment: async (issueId, file) => {
//     return await mockIssues.attachments.upload(issueId, file);
//   },

//   // comments
//   listComments: async (issueId) => {
//     return await mockIssues.comments.list(issueId);
//   },
//   createComment: async (issueId, data) => {
//     return await mockIssues.comments.create(issueId, data);
//   },
// };



import axiosClient from "./axiosClient";

export const issuesApi = {
  list: () => axiosClient.get("/issues/"),
  retrieve: (id) => axiosClient.get(`/issues/${id}/`),
  create: (data) => axiosClient.post("/issues/", data),
  update: (id, data) => axiosClient.patch(`/issues/${id}/`, data),
  assign: (id, data) => axiosClient.post(`/issues/${id}/assign/`, data),
  transition: (id, status) => axiosClient.post(`/issues/${id}/transition/`, { status }),
};