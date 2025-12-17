import  axiosClient  from "./axiosClient";

const profileApi = {
  // Get current user profile
  getProfile: () => {
    return axiosClient.get("/users/me/");
  },

  // Update profile (first_name, last_name)
  updateProfile: (data) => {
    return axiosClient.patch("/users/me/", data);
  },

  // Change password
  changePassword: (data) => {
    return axiosClient.post("/users/change-password/", data);
  },

  // Upload avatar image
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosClient.post("/users/me/avatar/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete avatar
  deleteAvatar: () => {
    return axiosClient.delete("/users/me/avatar/");
  },
};

export default profileApi;
