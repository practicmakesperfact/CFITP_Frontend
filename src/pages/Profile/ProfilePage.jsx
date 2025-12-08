
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

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // SAFELY LOAD USER
  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user_profile");
        if (raw) {
          const parsed = JSON.parse(raw);
          setFormData({
            first_name: parsed.first_name || "",
            last_name: parsed.last_name || "",
            email: parsed.email || "",
          });
          setProfilePic(parsed.profilePic || "");
        }
      } catch (e) {
        console.warn("Failed to load profile");
      }
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const liveUser = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    role: localStorage.getItem("user_role") || "client",
    created_at: user?.created_at || new Date().toISOString(),
    profilePic,
  };

  const fullName =
    `${liveUser.first_name || ""} ${liveUser.last_name || ""}`.trim() ||
    liveUser.email.split("@")[0];
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const memberSince = format(new Date(liveUser.created_at), "MMMM d, yyyy");

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
    const updated = { ...liveUser, ...formData, profilePic };
    localStorage.setItem("user_profile", JSON.stringify(updated));
    toast.success("Profile updated successfully!");
    setIsEditing(false);
    window.dispatchEvent(new Event("storage"));
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Fake save (real backend later)
    toast.success("Password changed successfully!");
    setPasswordData({ current: "", new: "", confirm: "" });
    setIsChangingPassword(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setProfilePic(base64);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

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
            {/* Avatar with Upload */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-8 ring-white shadow-2xl">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0EA5A4] to-teal-600 flex items-center justify-center text-white text-6xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
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
                    />
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="text-4xl font-bold text-slate-800 border-b-4 border-teal-500 focus:outline-none px-2"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
              ) : (
                <h2 className="text-4xl font-bold text-slate-800">
                  {fullName}
                </h2>
              )}

              <p className="text-xl text-slate-600 mt-2">{liveUser.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6">
                <span
                  className={`px-6 py-3 rounded-full font-bold text-sm border-2 ${getRoleColor(
                    liveUser.role
                  )}`}
                >
                  <Shield className="inline-block w-4 h-4 mr-2" />
                  {liveUser.role?.toUpperCase() || "CLIENT"}
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
                  {liveUser.email}
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveProfile}
              className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-xl transition transform hover:scale-105 flex items-center gap-3"
            >
              <Save size={26} /> Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
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
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.current}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current: e.target.value })
                }
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] outline-none text-lg"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new: e.target.value })
                }
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] outline-none text-lg"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirm}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm: e.target.value })
                }
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] outline-none text-lg"
              />
            </div>
            <div className="flex gap-4 mt-10">
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white py-4 rounded-2xl font-bold text-xl transition"
              >
                Update Password
              </button>
              <button
                onClick={() => setIsChangingPassword(false)}
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
