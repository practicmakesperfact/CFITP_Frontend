import axiosClient from "./axiosClient";

export const usersApi = {
  /**
   * Get all users (with optional filters)
   */
  getAllUsers: async (params = {}) => {
    try {
      // Try admin endpoint first
      const response = await axiosClient.get("/users/admin/users/", { params });
      console.log("Admin users API response:", response.data);

      // Handle response format
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.results) {
        return response.data.results;
      } else {
        return response.data ? [response.data] : [];
      }
    } catch (adminError) {
      console.warn(
        "Admin endpoint failed, falling back to regular endpoint:",
        adminError
      );

      // Fallback to regular users endpoint
      try {
        const response = await axiosClient.get("/users/", { params });

        // Handle response format
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data?.results) {
          return response.data.results;
        } else {
          return response.data ? [response.data] : [];
        }
      } catch (error) {
        console.error("Error fetching users:", error);

        // More detailed error information
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
          console.error("Response headers:", error.response.headers);
        }

        throw new Error(`Failed to fetch users: ${error.message}`);
      }
    }
  },

  /**
   * Get staff users
   */
  getStaffUsers: async () => {
    try {
      console.log("📞 Calling /users/staff/ endpoint...");
      const response = await axiosClient.get("/users/staff/");

      console.log("✅ Staff API Response status:", response.status);
      console.log("📦 Response data:", response.data);

      // Check what's actually in the response
      if (Array.isArray(response.data)) {
        console.log(`📊 Array with ${response.data.length} items received`);
        response.data.forEach((user, i) => {
          console.log(`User ${i}: ${user.email} - Role: ${user.role}`);
        });
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error:", error);
      return [];
    }
  },

  /**
   * Get user by ID with full details
   */
  getUserById: async (userId) => {
    try {
      const response = await axiosClient.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);

      if (error.response) {
        console.error("Response:", error.response.status, error.response.data);
      }

      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  },

  /**
   * Update user information
   */
  updateUser: async (userId, userData) => {
    try {
      console.log(`Updating user ${userId} with:`, userData);

      const response = await axiosClient.patch(`/users/${userId}/`, userData);
      console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);

      if (error.response) {
        console.error("Response:", error.response.status, error.response.data);

        // Extract validation errors
        if (error.response.status === 400) {
          const errors = error.response.data;
          const errorMessages = Object.entries(errors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");

          throw new Error(`Validation error: ${errorMessages}`);
        }
      }

      throw new Error(`Failed to update user: ${error.message}`);
    }
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId) => {
    try {
      console.log(`Deleting user ${userId}`);

      const response = await axiosClient.delete(`/users/${userId}/`);
      console.log("Delete response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);

      if (error.response) {
        console.error("Response:", error.response.status, error.response.data);

        if (error.response.status === 403) {
          throw new Error("You don't have permission to delete this user");
        }
      }

      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (userId, currentStatus) => {
    try {
      return await usersApi.updateUser(userId, { is_active: !currentStatus });
    } catch (error) {
      console.error(`Error toggling status for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Bulk user operations (activate, deactivate, delete)
   */
  bulkUserActions: async (userIds, action) => {
    try {
      console.log(`Bulk ${action} for users:`, userIds);

      const response = await axiosClient.post("/users/admin/users/bulk/", {
        user_ids: userIds,
        action: action,
      });

      console.log("Bulk action response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);

      if (error.response) {
        console.error("Response:", error.response.status, error.response.data);

        if (error.response.status === 400) {
          throw new Error(
            `Invalid request: ${JSON.stringify(error.response.data)}`
          );
        }
      }

      throw new Error(`Failed to perform bulk ${action}: ${error.message}`);
    }
  },

  /**
   * Create a new user (admin can create any role)
   */
  createUser: async (userData) => {
    try {
      console.log("Creating new user:", userData);

      // First try admin create endpoint
      try {
        const response = await axiosClient.post(
          "/users/admin/create/",
          userData
        );
        console.log("Admin create user response:", response.data);
        return response.data;
      } catch (adminError) {
        // If admin endpoint doesn't exist or fails, fall back to register endpoint
        console.log(
          "Admin endpoint failed, trying register endpoint:",
          adminError
        );

        // Use the register endpoint for creating users
        const response = await axiosClient.post("/users/register/", userData);
        console.log("Create user response:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error creating user:", error);

      if (error.response) {
        console.error("Response:", error.response.status, error.response.data);

        if (error.response.status === 400) {
          const errors = error.response.data;
          const errorMessages = Object.entries(errors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");

          throw new Error(`Validation error: ${errorMessages}`);
        }
      }

      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  // ============================================
  // REGULAR USER METHODS
  // ============================================

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get("/users/me/");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  /**
   * Update current user profile
   */
  updateCurrentUser: async (userData) => {
    try {
      const response = await axiosClient.patch("/users/me/", userData);
      return response.data;
    } catch (error) {
      console.error("Error updating current user:", error);
      throw error;
    }
  },

  /**
   * Change current user password
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axiosClient.post(
        "/users/change-password/",
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  /**
   * Upload avatar for current user
   */
  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axiosClient.post("/users/me/avatar/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },

  // ============================================
  // FILTERED USER LISTS
  // ============================================

  /**
   * Get all client users
   */
  getClientUsers: async () => {
    try {
      const response = await axiosClient.get("/users/clients/");

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.results) {
        return response.data.results;
      } else {
        return response.data ? [response.data] : [];
      }
    } catch (error) {
      console.error("Error fetching client users:", error);
      return [];
    }
  },

  /**
   * Search users with filters
   */
  searchUsers: async (filters = {}) => {
    try {
      const response = await axiosClient.get("/users/", { params: filters });

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.results) {
        return response.data.results;
      } else {
        return response.data ? [response.data] : [];
      }
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  },

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Format user data for display
   */
  formatUserForDisplay: (user) => {
    return {
      id: user.id,
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      full_name:
        user.full_name ||
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        "No name provided",
      role: user.role || "client",
      is_active: user.is_active !== undefined ? user.is_active : true,
      last_login: user.last_login,
      date_joined: user.date_joined || user.created_at,
      avatar_url: user.avatar_url,
    };
  },

  /**
   * Export users to CSV format
   */
  exportUsersToCSV: (users) => {
    if (!users || users.length === 0) {
      return "";
    }

    const headers = [
      "ID",
      "Email",
      "First Name",
      "Last Name",
      "Full Name",
      "Role",
      "Status",
      "Last Login",
      "Date Joined",
      "Is Active",
    ];

    const rows = users.map((user) => [
      user.id,
      user.email || "",
      user.first_name || "",
      user.last_name || "",
      `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
      user.role || "client",
      user.is_active ? "Active" : "Inactive",
      user.last_login ? new Date(user.last_login).toLocaleString() : "Never",
      user.date_joined
        ? new Date(user.date_joined).toLocaleDateString()
        : "N/A",
      user.is_active ? "Yes" : "No",
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  },

  /**
   * Validate user data before sending to API
   */
  validateUserData: (userData, isUpdate = false) => {
    const errors = {};

    if (!isUpdate) {
      // Validation for new users
      if (!userData.email || !userData.email.includes("@")) {
        errors.email = "Valid email is required";
      }

      if (!userData.password || userData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }

      if (userData.password !== userData.confirm_password) {
        errors.confirm_password = "Passwords do not match";
      }
    }

    // Common validations
    if (
      userData.role &&
      !["client", "staff", "manager", "admin"].includes(userData.role)
    ) {
      errors.role = "Role must be client, staff, manager, or admin";
    }

    if (userData.first_name && userData.first_name.length > 100) {
      errors.first_name = "First name too long";
    }

    if (userData.last_name && userData.last_name.length > 100) {
      errors.last_name = "Last name too long";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Check if current user is admin
   */
  isCurrentUserAdmin: async () => {
    try {
      const currentUser = await usersApi.getCurrentUser();
      return currentUser.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
};
