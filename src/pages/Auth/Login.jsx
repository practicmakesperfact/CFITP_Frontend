// src/pages/Auth/Login.jsx
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useUIStore } from "../../app/store/uiStore.js";
import { authApi } from "../../api/authApi.js";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Shield,
  Users,
  Briefcase,
  ChevronDown,
  Lock,
  Mail,
  LogIn,
  Check,
  Building2,
  Sparkles,
  Key,
  Smartphone,
} from "lucide-react";

// Import your company images
import companyBackground from "../../assets/company-background.jpg"; // Main background
import anrsLogo from "../../assets/image.jpg"; // Logo/decoration image

// Role options with icons
const ROLE_OPTIONS = [
  {
    value: "client",
    label: "Client",
    icon: <User size={18} />,
    description: "Submit issues & track progress",
  },
  {
    value: "staff",
    label: "Staff",
    icon: <Briefcase size={18} />,
    description: "Resolve assigned issues",
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Users size={18} />,
    description: "Manage team & reports",
  },
  {
    value: "admin",
    label: "Admin",
    icon: <Shield size={18} />,
    description: "System administration",
  },
];

export default function Login() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: "client",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const setUserRole = useUIStore((state) => state.setUserRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const from = location.state?.from?.pathname || "/dashboard";
  const watchedRole = watch("role");

  // Get selected role details
  const selectedRole =
    ROLE_OPTIONS.find((r) => r.value === watchedRole) || ROLE_OPTIONS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if account is locked
  const checkLockStatus = () => {
    const lockUntil = localStorage.getItem("lock_until");
    if (lockUntil && Date.now() < parseInt(lockUntil)) {
      setIsLocked(true);
      setLockTime(parseInt(lockUntil));
      return true;
    }
    localStorage.removeItem("lock_until");
    return false;
  };

  const onSubmit = async (data) => {
    // Check lock status
    if (checkLockStatus()) {
      const remaining = Math.ceil((lockTime - Date.now()) / 1000 / 60);
      toast.error(
        `Account temporarily locked. Try again in ${remaining} minutes.`
      );
      return;
    }

    try {
      // Real login
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      });

      const { access, refresh } = res.data;

      // Store tokens securely
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Get user profile with role
      const userRes = await authApi.me();
      const user = userRes.data;

      // Check if user's role matches selected role
      if (user.role !== data.role) {
        toast.error(`Please login as ${user.role} role`);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return;
      }

      // Store minimal user info
      localStorage.setItem("user_role", user.role);
      localStorage.setItem(
        "user_profile",
        JSON.stringify({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          avatar: user.avatar,
        })
      );

      setUserRole(user.role);

      // Reset login attempts on success
      setLoginAttempts(0);
      localStorage.removeItem("login_attempts");
      localStorage.removeItem("lock_until");

      toast.success(
        `Welcome back, ${user.first_name || user.role.toUpperCase()}!`
      );

      //Redirect to role-specific dashboard
      let redirectPath;
      switch (user.role) {
        case "client":
          redirectPath = "/app/dashboard/client";
          break;
        case "staff":
          redirectPath = "/app/dashboard/staff";
          break;
        case "manager":
          redirectPath = "/app/dashboard/manager";
          break;
        case "admin":
          redirectPath = "/app/dashboard/admin";
          break;
        default:
          redirectPath = "/app/dashboard";
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      // Handle login failure
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        // Lock account for 15 minutes
        const lockUntil = Date.now() + 15 * 60 * 1000;
        localStorage.setItem("lock_until", lockUntil.toString());
        localStorage.setItem("login_attempts", "5");
        setIsLocked(true);
        setLockTime(lockUntil);
        toast.error("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        localStorage.setItem("login_attempts", newAttempts.toString());

        if (err.response?.status === 401) {
          toast.error("Invalid email or password");
        } else if (err.response?.data?.detail) {
          toast.error(err.response.data.detail);
        } else {
          toast.error("Login failed. Please try again.");
        }
      }
    }
  };

  const handleRoleSelect = (role) => {
    setValue("role", role);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Left side - Enhanced Company Background */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex md:w-1/2 relative overflow-hidden group"
      >
        {/* Enhanced Background with Parallax Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${companyBackground})`,
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }}
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/90 to-teal-900/95"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>

            {/* Animated Light Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          </motion.div>
        </div>

        {/* Content Overlay with Floating Elements */}
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          {/* Floating Logo */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-8 right-8 w-24 h-24 opacity-20"
          >
          
          </motion.div>

          <div className="relative">
            {/* Company Header */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 mb-8"
            >
             
              <div>
                <h1 className="text-3xl font-bold tracking-wide">ANRS</h1>
                <p className="text-teal-200 text-sm font-semibold tracking-wider">
                  INNOVATION AND TECHNOLOGY BUREAU
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Sparkles size={12} className="text-yellow-300" />
                  <span className="text-xs text-teal-300">
                    Official Government Portal
                  </span>
                  <Sparkles size={12} className="text-yellow-300" />
                </div>
              </div>
            </motion.div>

            {/* Main Tagline */}
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold mb-6 leading-tight tracking-tight"
            >
              Client Feedback &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">
                Issue Tracking Portal
              </span>
            </motion.h2>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-teal-100 text-xl mb-10 max-w-2xl leading-relaxed"
            >
              Empowering innovation through seamless communication and
              <span className="font-semibold text-white">
                {" "}
                efficient issue resolution.
              </span>
            </motion.p>

            {/* Enhanced Features List */}
            <div className="space-y-6 max-w-2xl">
              {[
                {
                  icon: <Smartphone size={20} />,
                  title: "Real-time Issue Tracking",
                  description:
                    "Monitor and resolve issues instantly with live updates and notifications",
                },
                {
                  icon: <Key size={20} />,
                  title: "Secure Role-based Access",
                  description:
                    "Military-grade encryption with multi-factor authentication",
                },
                {
                  icon: <Shield size={20} />,
                  title: "Comprehensive Analytics",
                  description:
                    "AI-powered insights and detailed reporting for decision making",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:shadow-2xl"
                >
                  <div className="p-3 bg-gradient-to-br from-teal-500/30 to-amber-500/30 rounded-xl">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{feature.title}</p>
                    <p className="text-teal-200/90 text-sm">
                      {feature.description}
                    </p>
                  </div>
                  <div className="text-teal-300">
                    <Check size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Footer */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="pt-8 border-t border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-200 font-medium flex items-center gap-2">
                  <Building2 size={16} />© {new Date().getFullYear()} ANRS
                  Innovation Bureau
                </p>
                <p className="text-teal-200/80 text-sm mt-1">
                  Government Technology Platform v2.1.0 • ISO 27001 Certified
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Shield size={14} className="text-teal-300" />
                <span className="text-teal-200/80 text-sm">
                  End-to-End Encrypted
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Enhanced Login Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative"
      >
        {/* Decorative Background Pattern for Login Card */}
        <div className="absolute inset-0 md:hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${companyBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile Branding */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="md:hidden mb-8 text-center"
          >
            <div className="inline-flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-teal-700 to-teal-800 rounded-3xl shadow-2xl">
              <div className="w-16 h-16 flex items-center justify-center bg-white/20 rounded-2xl p-2">
                <img
                  src={anrsLogo}
                  alt="ANRS Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">ANRS</h1>
                <p className="text-teal-100 text-xs font-medium">
                  INNOVATION & TECHNOLOGY BUREAU
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles size={10} className="text-yellow-300" />
                  <span className="text-teal-200 text-xs">Official Portal</span>
                  <Sparkles size={10} className="text-yellow-300" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-teal-800 mt-4">
              Secure Login Portal
            </h2>
            <p className="text-gray-600">
              Access your dashboard with government credentials
            </p>
          </motion.div>

          {/* Enhanced Login Card with Image Background */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/30 overflow-hidden relative"
          >
            {/* Background Image Pattern in Card */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <img
                src={anrsLogo}
                alt="Pattern"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-amber-500 to-teal-500"></div>

            <div className="relative z-10">
              {/* Welcome Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-3 mb-4"
                >
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl shadow-lg">
                    <Key className="text-teal-600" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Welcome Back
                  </h2>
                </motion.div>
                <p className="text-gray-600">
                  Sign in to access your personalized dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Enhanced Role Dropdown */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase size={16} className="text-teal-600" />
                    Select Your Role
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl flex items-center justify-between hover:border-teal-400 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                          {selectedRole.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 text-lg">
                            {selectedRole.label}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {selectedRole.description}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`text-gray-500 transition-all duration-300 ${
                          dropdownOpen ? "rotate-180 text-teal-600" : ""
                        }`}
                        size={22}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <motion.button
                              key={role.value}
                              type="button"
                              whileHover={{ x: 5 }}
                              onClick={() => handleRoleSelect(role.value)}
                              className={`w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-all ${
                                watchedRole === role.value
                                  ? "bg-gradient-to-r from-teal-50 to-teal-100 border-l-4 border-l-teal-500"
                                  : "border-l-4 border-l-transparent"
                              }`}
                            >
                              <div
                                className={`p-3 rounded-xl ${
                                  watchedRole === role.value
                                    ? "bg-teal-500 text-white shadow-md"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {role.icon}
                              </div>
                              <div className="text-left flex-1">
                                <p
                                  className={`font-semibold ${
                                    watchedRole === role.value
                                      ? "text-teal-700"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {role.label}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {role.description}
                                </p>
                              </div>
                              {watchedRole === role.value && (
                                <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input
                    type="hidden"
                    {...register("role", { required: "Please select a role" })}
                  />
                </div>

                {/* Enhanced Email Field */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={16} className="text-teal-600" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600">
                      <Mail size={20} />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      {...register("email", {
                        required: "Government email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      placeholder="name.surname@anrs.gov"
                      className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 disabled:opacity-50 shadow-sm"
                      disabled={isSubmitting || isLocked}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                    >
                      <Shield size={12} />
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock size={16} className="text-teal-600" />
                    Secure Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600">
                      <Lock size={20} />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 disabled:opacity-50 shadow-sm"
                      disabled={isSubmitting || isLocked}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                    >
                      <Shield size={12} />
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" />
                      <div className="w-5 h-5 bg-gray-200 rounded border-2 border-gray-300 group-hover:border-teal-400 transition-colors"></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      Remember this device
                    </span>
                  </label>
                  <Link
                    to="/reset-password"
                    className="text-sm text-teal-600 hover:text-teal-800 font-semibold hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Enhanced Login Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || isLocked}
                  whileHover={{ scale: isSubmitting || isLocked ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting || isLocked ? 1 : 0.97 }}
                  className="w-full bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600 hover:from-teal-700 hover:via-teal-800 hover:to-teal-700 disabled:from-teal-400 disabled:to-teal-500 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-teal-200 hover:shadow-2xl hover:shadow-teal-300 disabled:shadow-none flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Authenticating...</span>
                    </>
                  ) : isLocked ? (
                    <>
                      <Lock size={24} />
                      <span>Account Secured</span>
                    </>
                  ) : (
                    <>
                      <LogIn
                        size={24}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                      <span>Sign In as {selectedRole.label}</span>
                      <Sparkles
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </>
                  )}
                </motion.button>

                {/* Security Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-6 border-t border-gray-100"
                >
                  <div className="flex items-center justify-center gap-3 text-sm bg-gradient-to-r from-gray-50 to-teal-50 p-4 rounded-2xl border border-gray-200">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Shield size={16} className="text-teal-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        ANRS ITB Security
                      </p>
                      <p className="text-gray-600 text-xs">
                        Enterprise-grade encryption & compliance
                      </p>
                    </div>
                  </div>
                </motion.div>
              </form>

              {/* Request Access Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-gray-100 text-center"
              >
                <p className="text-gray-600 mb-4 font-medium">
                  New to ANRS ITB Portal?
                </p>
                <Link
                  to="/request-access"
                  className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-50 via-white to-teal-50 border-2 border-teal-200 text-teal-700 hover:text-teal-800 hover:border-teal-300 hover:from-blue-100 hover:to-teal-100 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-100 group"
                >
                  <span>Request Access to Portal</span>
                  <ChevronDown
                    size={16}
                    className="-rotate-90 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <p className="text-xs text-gray-500 mt-3">
                  Access requires verification and approval from ANRS ITB
                  administrators
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="md:hidden mt-8 text-center"
          >
            <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-teal-50 rounded-full">
                <Shield size={12} className="text-teal-500" />
                <span>© {new Date().getFullYear()} ANRS Innovation Bureau</span>
              </div>
              <p className="text-xs">Government Technology Platform v2.1.0</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
