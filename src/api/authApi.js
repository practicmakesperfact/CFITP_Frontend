import axiosClient from "./axiosClient";
import publicClient from "./publicClient";

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await axiosClient.post("/auth/login/", credentials);
      console.log("Login successful:", response.data);
      return response;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log("Original registration data:", userData);

      // Transform camelCase to snake_case for Django
      const transformedData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || "client", // Default to client
        confirm_password: userData.confirmPassword || userData.confirm_password,
      };

      // Remove undefined fields
      Object.keys(transformedData).forEach((key) => {
        if (transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });

      console.log("Transformed registration data:", transformedData);

      const response = await publicClient.post(
        "/users/register/",
        transformedData
      );
      console.log("Registration successful:", response.data);
      return response;
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken && !refreshToken.startsWith("demo")) {
      try {
        await axiosClient.post("/auth/logout/", { refresh: refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    // Clear local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_profile");
  },

  me: async () => {
    try {
      const response = await axiosClient.get("/users/me/");
      
      return response;
    } catch (error) {
      console.error(
        "Profile fetch error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await axiosClient.post("/auth/refresh/", {
        refresh: refreshToken,
      });
      console.log("Token refreshed successfully");
      return response;
    } catch (error) {
      console.error(
        "Token refresh error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      const response = await axiosClient.post("/auth/reset-password/", {
        email,
      });
      console.log("Password reset email sent");
      return response;
    } catch (error) {
      console.error(
        "Password reset error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      const response = await axiosClient.post("/auth/change-password/", data);
      console.log("Password changed successfully");
      return response;
    } catch (error) {
      console.error(
        "Password change error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
