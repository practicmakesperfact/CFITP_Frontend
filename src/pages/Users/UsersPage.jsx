import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../api/usersApi";
import {
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  Shield,
  UserCog,
  Users,
  UserCheck,
  Ban,
  Save,
  X,
} from "lucide-react";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "client",
    password: "Default123!", // Default strong password
    confirm_password: "Default123!",
    is_active: true,
  });

  // Fetch all users
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", roleFilter, statusFilter, searchTerm],
    queryFn: () =>
      usersApi.getAllUsers({
        role: roleFilter !== "all" ? roleFilter : undefined,
        is_active:
          statusFilter !== "all" ? statusFilter === "active" : undefined,
        search: searchTerm || undefined,
      }),
    staleTime: 60000,
  });

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const isAdminUser = await usersApi.isCurrentUserAdmin();
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (userData) => usersApi.createUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["users"]);
      toast.success(`User created successfully as ${data.role}!`);
      resetForm();
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Error creating user: ${error.message}`);
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, userData }) => usersApi.updateUser(userId, userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["users"]);
      toast.success(`User updated successfully!`);
      resetForm();
      setIsEditing(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(`Error updating user: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId) => usersApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.success("User deleted successfully!");
      setSelectedUsers([]);
    },
    onError: (error) => {
      toast.error(`Error deleting user: ${error.message}`);
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, currentStatus }) =>
      usersApi.toggleUserStatus(userId, currentStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["users"]);
      const action = variables.currentStatus ? "deactivated" : "activated";
      toast.success(`User ${action} successfully!`);
    },
    onError: (error) => {
      toast.error(`Error toggling user status: ${error.message}`);
    },
  });

  // Bulk actions mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ userIds, action }) =>
      usersApi.bulkUserActions(userIds, action),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["users"]);
      toast.success(data.detail || "Bulk action completed!");
      setSelectedUsers([]);
    },
    onError: (error) => {
      toast.error(`Error performing bulk action: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      role: "client",
      password: "Default123!",
      confirm_password: "Default123!",
      is_active: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = usersApi.validateUserData(formData, false);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(", ");
      toast.error(`Validation errors: ${errorMessage}`);
      return;
    }

    // Create user object for API
    const userData = {
      email: formData.email.trim().toLowerCase(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: formData.role,
      password: formData.password,
      confirm_password: formData.confirm_password,
      is_active: formData.is_active,
    };

    createMutation.mutate(userData);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    const userData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: formData.role,
      is_active: formData.is_active,
    };

    // Only admin can change to admin role
    if (formData.role === "admin" && !isAdmin) {
      toast.error("Only administrators can assign admin role.");
      return;
    }

    updateMutation.mutate({
      userId: editingUser.id,
      userData,
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditing(true);
    setIsCreating(false);

    setFormData({
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role || "client",
      password: "", // Don't show password when editing
      confirm_password: "",
      is_active: user.is_active,
    });
  };

  const handleDeleteUser = (user) => {
    if (
      window.confirm(
        `Are you sure you want to delete user: ${user.email}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleToggleStatus = (user) => {
    const action = user.is_active ? "deactivate" : "activate";
    if (
      window.confirm(`Are you sure you want to ${action} user: ${user.email}?`)
    ) {
      toggleStatusMutation.mutate({
        userId: user.id,
        currentStatus: user.is_active,
      });
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    const userIds = selectedUsers.map((u) => u.id);
    const actionText =
      action === "delete"
        ? "delete"
        : action === "activate"
        ? "activate"
        : "deactivate";

    if (
      window.confirm(
        `Are you sure you want to ${actionText} ${selectedUsers.length} user(s)?`
      )
    ) {
      bulkActionMutation.mutate({ userIds, action });
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...users]);
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = usersApi.exportUsersToCSV(users);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `users_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Users exported to CSV successfully!");
    } catch (error) {
      toast.error(`Error exporting CSV: ${error.message}`);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "staff":
        return "bg-green-100 text-green-800 border border-green-200";
      case "client":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "manager":
        return <UserCog className="w-4 h-4" />;
      case "staff":
        return <Users className="w-4 h-4" />;
      case "client":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const formattedUser = usersApi.formatUserForDisplay(user);
    const matchesSearch =
      formattedUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formattedUser.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formattedUser.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formattedUser.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || formattedUser.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && formattedUser.is_active) ||
      (statusFilter === "inactive" && !formattedUser.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5A4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error loading users</h3>
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-[#0EA5A4] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all system users and their roles {isAdmin && "(Admin Mode)"}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
              resetForm();
            }}
            className="flex items-center px-4 py-2 bg-[#0EA5A4] text-white rounded-lg hover:bg-[#0d8c8b] transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-amber-600 mr-3" />
            <div>
              <p className="font-medium text-amber-800">Limited Permissions</p>
              <p className="text-sm text-amber-700">
                You are not logged in as an administrator. Some features may be
                restricted. Only administrators can create staff, manager, and
                admin accounts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all bg-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="client">Client</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 text-amber-600 mr-2" />
              <span className="font-medium text-amber-800">
                {selectedUsers.length} user(s) selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction("activate")}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors border border-green-200"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors border border-red-200"
              >
                Deactivate Selected
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                >
                  Delete Selected
                </button>
              )}
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create/Edit User Form */}
      {(isCreating || isEditing) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#0EA5A4]">
                {isEditing ? "Edit User" : "Add New User"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isEditing
                  ? `Editing: ${editingUser?.email}`
                  : "Create a new user account"}
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setEditingUser(null);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form
            onSubmit={isEditing ? handleUpdateSubmit : handleCreateSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all"
                />
              </div>

              {/* Email (only for creation) */}
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all"
                  />
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={!isAdmin && formData.role === "admin"}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all ${
                    !isAdmin && formData.role === "admin"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin" disabled={!isAdmin}>
                    Admin {!isAdmin && "(Admin Only)"}
                  </option>
                </select>
                {!isAdmin && formData.role === "admin" && (
                  <p className="text-sm text-amber-600 mt-1">
                    Only administrators can create admin accounts
                  </p>
                )}
              </div>

              {/* Status (for editing) */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, is_active: true }))
                        }
                        className="text-[#0EA5A4] focus:ring-[#0EA5A4]"
                      />
                      <span className="ml-2">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={!formData.is_active}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, is_active: false }))
                        }
                        className="text-[#0EA5A4] focus:ring-[#0EA5A4]"
                      />
                      <span className="ml-2">Inactive</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Password (only for creation) */}
              {!isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="8"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all"
                    />
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <p>• Minimum 8 characters</p>
                      <p>• At least one uppercase letter</p>
                      <p>• At least one lowercase letter</p>
                      <p>• At least one number</p>
                      <p>• At least one special character (@$!%*?&)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent transition-all"
                    />
                    {formData.password !== formData.confirm_password && (
                      <p className="text-red-600 text-xs mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                {isEditing
                  ? "Changes will take effect immediately after saving."
                  : "The user will receive an email notification with login details."}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                  className="px-6 py-3 bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {createMutation.isLoading || updateMutation.isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? "Update User" : "Create User"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Login
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Users className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm mt-1">
                        {searchTerm ||
                        roleFilter !== "all" ||
                        statusFilter !== "all"
                          ? "Try adjusting your filters or search terms"
                          : "Start by adding your first user"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const formattedUser = usersApi.formatUserForDisplay(user);
                  const isSelected = selectedUsers.find(
                    (u) => u.id === user.id
                  );

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handleSelectUser(user)}
                          className="rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0EA5A4] to-[#0d8c8b] flex items-center justify-center text-white font-semibold shadow-sm">
                              {formattedUser.first_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                formattedUser.email?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formattedUser.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formattedUser.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Joined:{" "}
                              {new Date(
                                formattedUser.date_joined
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              formattedUser.role
                            )}`}
                          >
                            <span className="mr-1.5">
                              {getRoleIcon(formattedUser.role)}
                            </span>
                            {formattedUser.role}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {formattedUser.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <Ban className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formattedUser.last_login
                          ? new Date(formattedUser.last_login).toLocaleString()
                          : "Never logged in"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1.5 hover:bg-blue-50 rounded"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`${
                              user.is_active
                                ? "text-amber-600 hover:text-amber-900 hover:bg-amber-50"
                                : "text-green-600 hover:text-green-900 hover:bg-green-50"
                            } transition-colors p-1.5 rounded`}
                            title={
                              user.is_active
                                ? "Deactivate user"
                                : "Activate user"
                            }
                          >
                            {user.is_active ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors p-1.5 rounded"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <UserCog className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Staff Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === "staff").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="text-center text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </motion.div>
  );
}
