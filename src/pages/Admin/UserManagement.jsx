// src/pages/Admin/UserManagement.jsx - WITH ADD/EDIT FUNCTIONALITY
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Download,
  Search,
  UserCheck,
  UserX,
  Filter,
  ChevronDown,
  Eye,
  Shield,
  Mail,
  Calendar,
  RefreshCw,
  UserCog,
  AlertCircle,
  X,
  Lock,
  Eye as EyeIcon,
  EyeOff,
  Save,
} from "lucide-react";
import { useAuth } from "../../app/hooks";
import { usersApi } from "../../api/usersApi";
import toast from "react-hot-toast";
import { format } from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";

// User Form Modal Component
function UserFormModal({ isOpen, onClose, user, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "client",
    password: "",
    confirm_password: "",
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form when modal opens or user changes
  useEffect(() => {
    if (user) {
      // Edit mode
      setFormData({
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "client",
        password: "", // Leave empty for edit
        confirm_password: "",
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      // Add mode
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        role: "client",
        password: "",
        confirm_password: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
    }

    if (!user && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!user && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    } else if (
      !["client", "staff", "manager", "admin"].includes(formData.role)
    ) {
      newErrors.role = "Invalid role selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      // Prepare data for API
      const userData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active,
      };

      // Only include password for new users
      if (!user) {
        userData.password = formData.password;
        userData.confirm_password = formData.confirm_password;
      }

      await onSubmit(user ? { id: user.id, ...userData } : userData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {user ? `Edit ${user.email}` : "Add New User"}
            </h2>
            <p className="text-slate-600 mt-1">
              {user ? "Update user information" : "Create a new user account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!!user} // Email cannot be changed for existing users
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } ${user ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] ${
                    errors.first_name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["client", "staff", "manager", "admin"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                    className={`p-4 rounded-xl border-2 text-center transition ${
                      formData.role === role
                        ? "border-[#0EA5A4] bg-teal-50 text-[#0EA5A4]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Shield className="mx-auto mb-2" size={20} />
                    <span className="font-medium capitalize">{role}</span>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Password Fields (only for new users) */}
            {!user && (
              <div className="space-y-6">
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock size={20} />
                    Set Password
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <EyeIcon size={20} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] ${
                          errors.confirm_password
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.confirm_password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.confirm_password}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-800">Account Status</h4>
                <p className="text-sm text-gray-600">
                  {formData.is_active
                    ? "User can login and use the system"
                    : "User account is disabled"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EA5A4]"></div>
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#0EA5A4] text-white rounded-xl hover:bg-[#0EA5A4]/80 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                {user ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save size={20} />
                {user ? "Update User" : "Create User"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch users
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const users = await usersApi.getAllUsers();
        return users.map((user) => usersApi.formatUserForDisplay(user));
      } catch (error) {
        console.error("Error in queryFn:", error);
        toast.error("Failed to load users");
        throw error;
      }
    },
    enabled: currentUser?.role === "admin",
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      console.log("Creating user:", userData);
      return await usersApi.createUser(userData);
    },
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created successfully");
      setShowAddModal(false);
    },
    onError: (error) => {
      console.error("Create user error:", error);
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }) => {
      console.log("Updating user:", id, userData);
      return await usersApi.updateUser(id, userData);
    },
    onSuccess: (data) => {
      console.log("User updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully");
      setEditingUser(null);
    },
    onError: (error) => {
      console.error("Update user error:", error);
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      console.log("Deleting user:", userId);
      return await usersApi.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully");
      setSelectedUsers([]);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  // Handlers
  const handleToggleStatus = async (user) => {
    try {
      console.log("Toggling status for:", user.id, "Current:", user.is_active);
      await updateUserMutation.mutateAsync({
        id: user.id,
        is_active: !user.is_active,
      });
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot delete yourself!");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${user.email}? This action cannot be undone.`
      )
    ) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleEditUser = (user) => {
    console.log("Editing user:", user);
    setEditingUser(user);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleSubmitUser = async (userData) => {
    if (userData.id) {
      // Update existing user
      await updateUserMutation.mutateAsync(userData);
    } else {
      // Create new user
      await createUserMutation.mutateAsync(userData);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    switch (action) {
      case "activate":
        try {
          await Promise.all(
            selectedUsers.map((userId) =>
              usersApi.updateUser(userId, { is_active: true })
            )
          );
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          toast.success(`${selectedUsers.length} users activated`);
          setSelectedUsers([]);
        } catch (error) {
          toast.error("Failed to activate users");
        }
        break;

      case "deactivate":
        try {
          await Promise.all(
            selectedUsers.map((userId) =>
              usersApi.updateUser(userId, { is_active: false })
            )
          );
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          toast.success(`${selectedUsers.length} users deactivated`);
          setSelectedUsers([]);
        } catch (error) {
          toast.error("Failed to deactivate users");
        }
        break;

      case "export":
        exportUsers();
        break;

      case "delete":
        const confirmDelete = window.confirm(
          `Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`
        );
        if (confirmDelete) {
          try {
            await Promise.all(
              selectedUsers.map((userId) => usersApi.deleteUser(userId))
            );
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success(`${selectedUsers.length} users deleted`);
            setSelectedUsers([]);
          } catch (error) {
            toast.error("Failed to delete users");
          }
        }
        break;
    }
  };

  // Export users to CSV
  const exportUsers = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to export");
      return;
    }

    setIsExporting(true);

    try {
      const csvContent = usersApi.exportUsersToCSV(filteredUsers);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users-export-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredUsers.length} users to CSV`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "manager":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "staff":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "client":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-[#0EA5A4]" size={48} />
        <p className="mt-4 text-slate-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <AlertCircle className="text-red-500" size={48} />
        <h3 className="text-xl font-semibold text-slate-800 mt-4">
          Error Loading Users
        </h3>
        <p className="text-slate-600 mt-2 text-center">
          {error.message ||
            "Failed to fetch users. Please check console for details."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 bg-[#0EA5A4] text-white rounded-lg hover:bg-[#0EA5A4]/80 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 pb-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              User Management
            </h1>
            <p className="text-slate-600 mt-2">
              Manage all system users ({filteredUsers.length} found)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => refetch()}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              title="Refresh users"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-[#0EA5A4] text-white rounded-lg hover:bg-[#0EA5A4]/80 transition flex items-center gap-2"
            >
              <UserPlus size={20} />
              Add User
            </button>
            <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
              <UserCog className="text-[#0EA5A4]" size={24} />
              <span className="font-medium text-slate-700">
                {currentUser?.first_name || currentUser?.email || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] cursor-pointer hover:bg-gray-100 transition"
                >
                  <option value="all">All Roles</option>
                  <option value="client">Clients</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Managers</option>
                  <option value="admin">Admins</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-4 pointer-events-none text-gray-500"
                  size={20}
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] cursor-pointer hover:bg-gray-100 transition"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-4 pointer-events-none text-gray-500"
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="text-teal-600" size={20} />
                  <span className="font-medium text-teal-800">
                    {selectedUsers.length} user
                    {selectedUsers.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                  >
                    Activate Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                  >
                    Deactivate Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction("export")}
                    disabled={isExporting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} />
                    {isExporting ? "Exporting..." : "Export Selected"}
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Selected
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <Lottie animationData={emptyAnimation} className="w-72 mx-auto" />
              <p className="text-slate-600 mt-4 text-lg">
                {users.length === 0
                  ? "No users found in system"
                  : "No users match your filters"}
              </p>
              {searchTerm && (
                <p className="text-slate-500 mt-2">
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map((u) => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                      />
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      User
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Last Login
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Joined
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter((id) => id !== user.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0EA5A4] to-[#FB923C] flex items-center justify-center text-white font-bold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                            user.role
                          )}`}
                        >
                          <Shield size={12} className="mr-1" />
                          {user.role?.charAt(0).toUpperCase() +
                            user.role?.slice(1) || "Unknown"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={user.id === currentUser?.id}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition ${
                            user.is_active
                              ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200"
                              : "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                          } ${
                            user.id === currentUser?.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={
                            user.id === currentUser?.id
                              ? "Cannot change your own status"
                              : ""
                          }
                        >
                          {user.is_active ? (
                            <>
                              <UserCheck size={12} className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX size={12} className="mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {user.last_login
                          ? format(
                              new Date(user.last_login),
                              "MMM d, yyyy HH:mm"
                            )
                          : "Never"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(user.date_joined), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit user"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.id === currentUser?.id}
                            className={`p-2 rounded-lg transition ${
                              user.id === currentUser?.id
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            title={
                              user.id === currentUser?.id
                                ? "Cannot delete yourself"
                                : "Delete user"
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-slate-800">
                  {users.length}
                </p>
              </div>
              <Users className="text-[#0EA5A4]" size={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-slate-800">
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>
              <UserCheck className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-3xl font-bold text-slate-800">
                  {users.filter((u) => u.role === "client").length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">C</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Staff/Managers</p>
                <p className="text-3xl font-bold text-slate-800">
                  {
                    users.filter((u) =>
                      ["staff", "manager", "admin"].includes(u.role)
                    ).length
                  }
                </p>
              </div>
              <Shield className="text-blue-500" size={32} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit User Modal */}
      <UserFormModal
        isOpen={showAddModal || !!editingUser}
        onClose={() => {
          setShowAddModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={handleSubmitUser}
        isSubmitting={
          createUserMutation.isPending || updateUserMutation.isPending
        }
      />
    </>
  );
}
