import axiosClient from './axiosClient.js'

export const issuesApi = {
  list: (params) => axiosClient.get('/issues/', { params }),
  create: (data) => axiosClient.post('/issues/', data),
  retrieve: (id) => axiosClient.get(`/issues/${id}/`),
  update: (id, data) => axiosClient.patch(`/issues/${id}/`, data),
  assign: (id, assignee_id) => axiosClient.post(`/issues/${id}/assign/`, { assignee_id }),
  transition: (id, status) => axiosClient.post(`/issues/${id}/transition/`, { status }),
  delete: (id) => axiosClient.delete(`/issues/${id}/`)
}