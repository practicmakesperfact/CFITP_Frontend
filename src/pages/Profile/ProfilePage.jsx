// src/pages/Profile/ProfilePage.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../app/hooks.js";
import profileApi from "../../api/profileApi.js"; // Import the API
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Use the user data from auth hook (which already fetches from backend)
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      // Update cache
      queryClient.setQueryData(["user-profile"], response.data);
      setIsEditing(false);
    },
    onError: (error) => {
      const message =
        error.response?.data?.detail || "Failed to update profile";
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
      } else {
        toast.error("Failed to change password");
      }
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file) => profileApi.uploadAvatar(file),
    onSuccess: (response) => {
      toast.success("Profile picture updated!");
      // Update cache
      queryClient.setQueryData(["user-profile"], response.data);
    },
    onError: (error) => {
      const message =
        error.response?.data?.error || "Failed to upload image. Max size: 5MB";
      toast.error(message);
    },
  });

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

    changePasswordMutation.mutate({
      old_password: passwordData.current,
      new_password: passwordData.new,
      confirm_password: passwordData.confirm,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  // YOUR EXACT UI CODE BELOW - Only backend calls changed
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 space-y-10"
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold text-slate-800">Profile</h1>
        <p className="text-lg text-slate-600 mt-2">Manage your account</p>
      </div>

      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="h-48 bg-gradient-to-r from-[#0EA5A4] via-teal-500 to-cyan-500 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        </div>

        <div className="relative px-10 pb-12 -mt-20">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar with Upload - UPDATED to use backend avatar */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-8 ring-white shadow-2xl">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0EA5A4] to-teal-600 flex items-center justify-center text-white text-6xl font-bold">
                    {initials}
                  </div>
                )}

                {/* Show loading spinner during upload */}
                {uploadAvatarMutation.isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isLoading}
                className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition opacity-0 group-hover:opacity-100"
              >
                <Camera size={20} className="text-slate-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadAvatarMutation.isLoading}
              />
            </div>

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
                      className="text-4xl font-bold text-slate-800 border-b-4 border-teal-500 focus:outline-none px-2"
                      placeholder="First Name"
                      disabled={updateProfileMutation.isLoading}
                    />
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="text-4xl font-bold text-slate-800 border-b-4 border-teal-500 focus:outline-none px-2"
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

        {/* Info Grid - EXACTLY LIKE YOUR UI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 pb-10">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <User className="w-6 h-6 text-[#0EA5A4]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="text-lg font-semibold text-slate-800">
                  {fullName}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Mail className="w-6 h-6 text-[#0EA5A4]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email Address</p>
                <p className="text-lg font-semibold text-slate-800 break-all">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Calendar className="w-6 h-6 text-[#0EA5A4]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Joined</p>
                <p className="text-lg font-semibold text-slate-800">
                  {memberSince}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons - UPDATED with loading states */}
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

      {/* Change Password Modal - UPDATED */}
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
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.current}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current: e.target.value })
                }
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] outline-none text-lg"
                disabled={changePasswordMutation.isLoading}
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new: e.target.value })
                }
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] outline-none text-lg"
                disabled={changePasswordMutation.isLoading}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirm}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm: e.target.value })
                }
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] outline-none text-lg"
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
