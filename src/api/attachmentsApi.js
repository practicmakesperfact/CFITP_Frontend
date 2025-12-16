// attachmentsApi.js
import axiosClient from "./axiosClient";

export const attachmentsApi = {
  // List attachments for an issue
  list: (issueId) => {
    return axiosClient.get(`/attachments/`, {
      params: { issue: issueId },
    });
  },

  // Upload attachment
  create: (issueId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Send issue as string UUID
    if (issueId && issueId !== "null" && issueId !== "undefined") {
      formData.append("issue", issueId);
    }

    return axiosClient.post(`/attachments/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Upload attachment for comment
  createForComment: (commentId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    if (commentId && commentId !== "null" && commentId !== "undefined") {
      formData.append("comment", commentId);
    }

    return axiosClient.post(`/attachments/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (id) => axiosClient.delete(`/attachments/${id}/`),

  download: (id) => {
    return axiosClient.get(`/attachments/${id}/download/`, {
      responseType: 'blob',
      headers: {
        'Accept': '*/*'
      }
    });
  },

  // Get authenticated URL for direct access (for images)
  getAuthenticatedUrl: (id, type = 'download') => {
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
    const endpoint = type === 'preview' ? 'preview' : 'download';
    
    return `${baseUrl}/attachments/${id}/${endpoint}/?token=${token}`;
  }
};
