import axiosClient from "./axiosClient.js";

export const attachmentsApi = {
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/attachments/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
  },
  download: (id) =>
    `${import.meta.env.VITE_API_BASE_URL}/attachments/${id}/download/`,
};
