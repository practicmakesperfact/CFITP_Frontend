import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Edit2,
  Mail,
  User,
  Calendar,
  Shield,
  Save,
  X,
  Camera,
  Lock,
  Trash2,
  Loader,
  AlertCircle,
  Check,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../app/hooks.js";
import profileApi from "../../api/profileApi.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const avatarMenuRef = useRef(null);

  // Close avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target)
      ) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use the user data from auth hook
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Helper function to refresh user data (silently, no toast)
  const refreshUserData = async () => {
    try {
      await queryClient.invalidateQueries(["user-profile"]);
      await queryClient.invalidateQueries(["auth"]);

      // If your useAuth uses React Query, you might need to refetch specific queries
      const authQueries = queryClient.getQueryCache().findAll(["auth", "user"]);
      authQueries.forEach((query) => {
        queryClient.invalidateQueries(query.queryKey);
      });
    } catch (error) {
      console.log("Profile refresh completed silently");
    }
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      // Update cache directly
      queryClient.setQueryData(["user-profile"], response);
      queryClient.setQueryData(["auth", "user"], response);
      setIsEditing(false);

      // Refresh user data silently in background (no toast)
      refreshUserData();
    },
    onError: (error) => {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to update profile";
      toast.error(message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => profileApi.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setIsChangingPassword(false);
    },
    onError: (error) => {
      const errors = error.response?.data;
      if (errors?.old_password) {
        toast.error("Current password is incorrect");
      } else if (errors?.new_password) {
        toast.error(errors.new_password[0]);
      } else if (errors?.error) {
        toast.error(errors.error);
      } else {
        toast.error("Failed to change password");
      }
    },
  });

  // Upload avatar mutation with progress tracking
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      setUploadProgress(0);
      const response = await profileApi.uploadAvatar(file);
      setUploadProgress(100);
      return response;
    },
    onSuccess: (response) => {
      toast.success("Profile picture updated!");
      // Update cache directly
      queryClient.setQueryData(["user-profile"], response);
      queryClient.setQueryData(["auth", "user"], response);
      setShowAvatarMenu(false);
      setUploadProgress(0);

      // Refresh user data silently in background (no toast)
      refreshUserData();
    },
    onError: (error) => {
      const message = error.message || "Failed to upload image";
      toast.error(message);
      setUploadProgress(0);
    },
  });

  // Remove avatar mutation
  const removeAvatarMutation = useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: (response) => {
      toast.success("Profile picture removed!");
      // Update cache directly
      queryClient.setQueryData(["user-profile"], response);
      queryClient.setQueryData(["auth", "user"], response);
      setShowAvatarMenu(false);

      // Refresh user data silently in background (no toast)
      refreshUserData();
    },
    onError: (error) => {
      const message = error.message || "Failed to remove profile picture";
      toast.error(message);
    },
  });

  // Manual refresh function (with optional toast)
  const handleManualRefresh = async (showToast = false) => {
    try {
      await refreshUserData();
      if (showToast) {
        toast.success("Profile data refreshed!");
      }
    } catch (error) {
      if (showToast) {
        toast.error("Failed to refresh profile data");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5A4]"></div>
      </div>
    );
  }

  const currentUser = user || {};
  const fullName =
    `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() ||
    currentUser.email?.split("@")[0] ||
    "";
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const memberSince = format(
    new Date(currentUser.date_joined || currentUser.created_at || new Date()),
    "MMMM d, yyyy"
  );

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "staff":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-teal-100 text-teal-700 border-teal-200";
    }
  };

  const validateImageFile = (file) => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return false;
    }

    // Check file size (max 5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(
        `File size must be less than 5MB. Current: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
      return false;
    }

    return true;
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
    });
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    changePasswordMutation.mutate({
      old_password: passwordData.current,
      new_password: passwordData.new,
      confirm_password: passwordData.confirm,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input
    e.target.value = null;

    // Validate file
    if (!validateImageFile(file)) {
      return;
    }

    console.log("Starting avatar upload...");
    uploadAvatarMutation.mutate(file);
  };

  const handleRemoveAvatar = () => {
    if (!currentUser.avatar_url) {
      toast.error("No profile picture to remove");
      return;
    }

    if (
      window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      console.log("Starting avatar removal...");
      removeAvatarMutation.mutate();
    }
  };

  const handleAvatarClick = () => {
    if (currentUser.avatar_url) {
      setShowAvatarMenu(!showAvatarMenu);
    } else {
      fileInputRef.current?.click();
    }
  };

  const isLoading =
    uploadAvatarMutation.isLoading || removeAvatarMutation.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 space-y-10"
    >
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-5xl font-bold text-slate-800">Profile</h1>
          <p className="text-lg text-slate-600 mt-2">Manage your account</p>
        </div>
        <button
          onClick={() => handleManualRefresh(true)}
          className="p-2 text-slate-600 hover:text-[#0EA5A4] transition-colors"
          title="Refresh profile data"
          disabled={
            updateProfileMutation.isLoading ||
            uploadAvatarMutation.isLoading ||
            removeAvatarMutation.isLoading
          }
        >
          <RefreshCw
            size={24}
            className={
              updateProfileMutation.isLoading ||
              uploadAvatarMutation.isLoading ||
              removeAvatarMutation.isLoading
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* Profile Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="h-48 bg-gradient-to-r from-[#0EA5A4] via-teal-500 to-cyan-500 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        </div>

        <div className="relative px-10 pb-12 -mt-20">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative" ref={avatarMenuRef}>
              <div className="relative">
                {/* Avatar Button */}
                <button
                  onClick={handleAvatarClick}
                  disabled={isLoading}
                  className="w-40 h-40 rounded-full overflow-hidden ring-8 ring-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#0EA5A4] transition-all disabled:opacity-75 disabled:cursor-not-allowed relative group"
                >
                  {currentUser.avatar_url ? (
                    <>
                      <img
                        src={currentUser.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => {
                          console.error(
                            "Failed to load avatar image:",
                            currentUser.avatar_url
                          );
                          e.target.style.display = "none";
                        }}
                      />
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0EA5A4] to-teal-600 flex items-center justify-center text-white text-6xl font-bold">
                      {initials}
                    </div>
                  )}

                  {/* Loading Spinner */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader className="animate-spin text-white w-10 h-10" />
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-16 h-16 mx-auto mb-2">
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                            <div
                              className="absolute inset-0 border-4 border-white border-t-transparent rounded-full"
                              style={{
                                transform: `rotate(${uploadProgress * 3.6}deg)`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-sm">{Math.round(uploadProgress)}%</p>
                      </div>
                    </div>
                  )}

                  {/* Camera Icon for empty avatar */}
                  {!currentUser.avatar_url && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera size={48} className="text-white/80" />
                    </div>
                  )}
                </button>

                {/* Upload Button (always visible) */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload new photo"
                >
                  <Camera size={20} className="text-slate-600" />
                </button>

                {/* File input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>

              {/* Avatar Action Menu */}
              <AnimatePresence>
                {showAvatarMenu && currentUser.avatar_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute left-0 right-0 -bottom-24 z-50"
                  >
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                      <div className="space-y-2">
                        
                        <div className="border-t border-gray-200"></div>
                        <button
                          onClick={handleRemoveAvatar}
                          disabled={isLoading}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={18} />
                          <span>Remove Photo</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File Size Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <AlertCircle size={12} />
                  Max 5MB • JPEG, PNG, GIF, WebP
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="text-4xl font-bold text-slate-800 border-b-4 border-teal-500 focus:outline-none px-2 bg-transparent"
                      placeholder="First Name"
                      disabled={updateProfileMutation.isLoading}
                    />
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="text-4xl font-bold text-slate-800 border-b-4 border-teal-500 focus:outline-none px-2 bg-transparent"
                      placeholder="Last Name"
                      disabled={updateProfileMutation.isLoading}
                    />
                  </div>
                </div>
              ) : (
                <h2 className="text-4xl font-bold text-slate-800">
                  {fullName}
                </h2>
              )}

              <p className="text-xl text-slate-600 mt-2">{currentUser.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6">
                <span
                  className={`px-6 py-3 rounded-full font-bold text-sm border-2 ${getRoleColor(
                    currentUser.role
                  )}`}
                >
                  <Shield className="inline-block w-4 h-4 mr-2" />
                  {currentUser.role?.toUpperCase() || "CLIENT"}
                </span>
                <span className="text-slate-500 flex items-center gap-2 text-lg">
                  <Calendar size={20} />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 pb-10">
          <InfoCard
            icon={<User className="w-6 h-6 text-[#0EA5A4]" />}
            label="Full Name"
            value={fullName}
          />
          <InfoCard
            icon={<Mail className="w-6 h-6 text-[#0EA5A4]" />}
            label="Email Address"
            value={currentUser.email}
          />
          <InfoCard
            icon={<Calendar className="w-6 h-6 text-[#0EA5A4]" />}
            label="Joined"
            value={memberSince}
          />
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isLoading}
              className={`bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-xl transition transform hover:scale-105 flex items-center gap-3 ${
                updateProfileMutation.isLoading
                  ? "opacity-75 cursor-not-allowed"
                  : ""
              }`}
            >
              {updateProfileMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={26} /> Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={updateProfileMutation.isLoading}
              className="border-2 border-red-300 text-red-600 hover:bg-red-50 px-10 py-5 rounded-2xl font-bold text-xl transition"
            >
              <X size={26} /> Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-xl transition transform hover:scale-105 flex items-center gap-3"
            >
              <Edit2 size={26} /> Edit Profile
            </button>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="border-2 border-slate-300 text-slate-700 hover:bg-gray-50 px-12 py-5 rounded-2xl font-bold text-xl transition flex items-center gap-3"
            >
              <Lock size={26} /> Change Password
            </button>
          </>
        )}
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
              Change Password
            </h2>
            <div className="space-y-6">
              <PasswordInput
                label="Current Password"
                value={passwordData.current}
                onChange={(value) =>
                  setPasswordData({ ...passwordData, current: value })
                }
                disabled={changePasswordMutation.isLoading}
              />
              <PasswordInput
                label="New Password"
                value={passwordData.new}
                onChange={(value) =>
                  setPasswordData({ ...passwordData, new: value })
                }
                disabled={changePasswordMutation.isLoading}
              />
              <PasswordInput
                label="Confirm New Password"
                value={passwordData.confirm}
                onChange={(value) =>
                  setPasswordData({ ...passwordData, confirm: value })
                }
                disabled={changePasswordMutation.isLoading}
              />
            </div>
            <div className="flex gap-4 mt-10">
              <button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isLoading}
                className={`flex-1 bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white py-4 rounded-2xl font-bold text-xl transition ${
                  changePasswordMutation.isLoading
                    ? "opacity-75 cursor-not-allowed"
                    : ""
                }`}
              >
                {changePasswordMutation.isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </div>
                ) : (
                  "Update Password"
                )}
              </button>
              <button
                onClick={() => setIsChangingPassword(false)}
                disabled={changePasswordMutation.isLoading}
                className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-gray-50 py-4 rounded-2xl font-bold text-xl transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// Helper Components
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-teal-100 rounded-xl">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-800 break-all">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, disabled, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-6 py-4 rounded-2xl border-2 focus:outline-none text-lg ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-gray-200 focus:border-[#0EA5A4]"
        }`}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
