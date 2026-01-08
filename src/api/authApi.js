import axiosClient from "./axiosClient";
import publicClient from "./publicClient";

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await axiosClient.post("/auth/login/", credentials);

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

  // In authApi.js logout function
  logout: async () => {
    console.log("🧨 NUCLEAR LOGOUT STARTED");

    // 1. Clear ALL caches first
    if (window.queryClient) {
      // Clear all queries
      window.queryClient.clear();
      window.queryClient.removeQueries();

      // Clear cache storage
      window.queryClient.getQueryCache().clear();
    }

    // 2. Clear localStorage
    localStorage.clear();
    sessionStorage.clear();

    // 3. Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 4. Force redirect with cache busting
    const timestamp = Date.now();
    window.location.href = `/login?t=${timestamp}&logout=true&nocache=1`;

    // Prevent any further execution
    throw new Error("Logout complete - redirecting");
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
