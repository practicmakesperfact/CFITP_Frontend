// src/api/usersApi.js - UPDATED
import axiosClient from "./axiosClient";

export const usersApi = {
  // Get staff users with proper response handling
  getStaffUsers: async () => {
    try {
      const response = await axiosClient.get("/users/?role=staff");

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response; // Direct array
      } else if (response.data && Array.isArray(response.data.results)) {
        // Paginated response
        return { data: response.data.results };
      } else if (response.data && typeof response.data === "object") {
        // Single object or other structure
        console.warn("Unexpected staff users response format:", response.data);
        return { data: [] };
      } else {
        return { data: response.data || [] };
      }
    } catch (error) {
      console.error("Error fetching staff users:", error);
      return { data: [] };
    }
  },

  // Alternative endpoint
  getStaffUsersAction: async () => {
    try {
      const response = await axiosClient.get("/users/staff/");

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response;
      } else {
        console.warn("Unexpected staff action response:", response.data);
        return { data: response.data || [] };
      }
    } catch (error) {
      console.error("Error fetching staff action:", error);
      return { data: [] };
    }
  },

  // Get all users with optional filtering
  getUsers: (params = {}) => axiosClient.get("/users/", { params }),

  // ... other methods
};
