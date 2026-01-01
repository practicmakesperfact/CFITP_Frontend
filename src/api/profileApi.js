import axiosClient from "./axiosClient";

const profileApi = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await axiosClient.get("/users/me/");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Update profile (first_name, last_name)
  updateProfile: async (data) => {
    try {
      const response = await axiosClient.patch("/users/me/", data);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Change password
  changePassword: async (data) => {
    try {
      const response = await axiosClient.post("/users/change-password/", data);
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // Upload avatar image (POST)
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosClient.post("/users/me/avatar/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading avatar:", error);

      // Provide better error messages
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400 && data.error) {
          throw new Error(data.error);
        } else if (status === 405) {
          throw new Error(
            "Avatar upload endpoint not available. Please check backend configuration."
          );
        } else if (status === 413) {
          throw new Error("File too large. Maximum size is 5MB.");
        }
      }

      throw new Error("Failed to upload avatar. Please try again.");
    }
  },

  // Remove avatar (DELETE)
  removeAvatar: async () => {
    try {
      const response = await axiosClient.delete("/users/me/avatar/");
      return response.data;
    } catch (error) {
      console.error("Error removing avatar:", error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400 && data.error) {
          throw new Error(data.error);
        } else if (status === 405) {
          throw new Error(
            "Avatar removal endpoint not available. Please check backend configuration."
          );
        }
      }

      throw new Error("Failed to remove avatar. Please try again.");
    }
  },
};

export default profileApi;
