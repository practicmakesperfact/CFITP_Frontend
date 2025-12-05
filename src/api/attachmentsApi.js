import axiosClient from "./axiosClient";

export const attachmentsApi = {
  // List attachments for an issue
  list: (issueId) => {
    return axiosClient.get(`/attachments/`).then((res) => {
      const allAttachments = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      // Filter by issue ID
      return {
        data: allAttachments.filter((att) => att.issue === issueId),
      };
    });
  },

  // Upload attachment - include ALL required fields
  create: (issueId, file, uploadedById) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("issue", issueId); // Required field
    formData.append("uploaded_by", uploadedById); // Required field

    return axiosClient.post(`/attachments/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (id) => axiosClient.delete(`/attachments/${id}/`),
  download: (id) =>
    axiosClient.get(`/attachments/${id}/download/`, {
      responseType: "blob",
    }),
};
