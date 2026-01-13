// src/pages/Auth/Register.jsx
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import {
  User,
  Briefcase,
  Users,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus,
  ChevronDown,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { authApi } from "../../api/authApi.js";

// Import images
import companyBackground from "../../assets/company-background.jpg";
import anrsLogo from "../../assets/image.jpg";

// Role options - Only Client for registration
const ROLE_OPTIONS = [
  {
    value: "client",
    label: "Client",
    icon: <User size={20} />,
    description: "Submit issues & track progress",
    color: "from-teal-500 to-teal-600",
  },
];

export default function Register() {
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
      confirmPassword: "",
      first_name: "",
      last_name: "",
      role: "client",
      terms: false,
    },
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const watchedRole = watch("role");

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

  const onSubmit = async (data) => {
    try {
      const backendData = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        role: data.role,
        confirm_password: data.confirmPassword,
      };

      await authApi.register(backendData);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_profile");

      toast.success(
        <div>
          <p className="font-bold">Account created successfully!</p>
          <p className="text-sm">Please login with your credentials.</p>
        </div>,
        { duration: 4000 }
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errData = err.response?.data || {};

      if (errData.email) {
        toast.error(
          `Email: ${
            Array.isArray(errData.email) ? errData.email[0] : errData.email
          }`
        );
      } else if (errData.password) {
        toast.error(
          `Password: ${
            Array.isArray(errData.password)
              ? errData.password[0]
              : errData.password
          }`
        );
      } else if (errData.detail) {
        toast.error(errData.detail);
      } else {
        toast.error("Registration failed. Please check your information.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex md:w-2/5 relative overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${companyBackground})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/95 via-teal-800/90 to-teal-900/95"></div>
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <img
                  src={anrsLogo}
                  alt="ANRS Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ANRS</h1>
                <p className="text-teal-200 text-sm font-medium">
                  INNOVATION AND TECHNOLOGY BUREAU
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Client Portal
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">
                Registration
              </span>
            </h2>

            <p className="text-teal-100 text-lg mb-10 leading-relaxed">
              Join thousands of clients who trust us with their feedback and
              issue tracking needs.
            </p>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="p-2 bg-teal-500/30 rounded-lg">
                  <User size={20} className="text-teal-200" />
                </div>
                <div>
                  <p className="font-medium">Submit Feedback</p>
                  <p className="text-teal-200/90 text-sm">
                    Report issues directly to our team
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="p-2 bg-teal-500/30 rounded-lg">
                  <Lock size={20} className="text-teal-200" />
                </div>
                <div>
                  <p className="font-medium">Track Progress</p>
                  <p className="text-teal-200/90 text-sm">
                    Monitor your reported issues in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Right side - Registration Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full md:w-3/5 flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="md:hidden mb-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium mb-6"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>

            <div className="inline-flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-lg">
              <div className="w-14 h-14 flex items-center justify-center bg-white/20 rounded-xl">
                <img
                  src={anrsLogo}
                  alt="ANRS Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white">ANRS</h1>
                <p className="text-teal-100 text-xs">
                  INNOVATION & TECHNOLOGY BUREAU
                </p>
              </div>
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
            {/* Desktop Back Link */}
            <div className="hidden md:block mb-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium"
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                Fill in your details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Dropdown - Single option (Client) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Briefcase size={14} className="text-teal-600" />
                  Account Type
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                        <User size={18} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Client</p>
                        <p className="text-xs text-gray-500">
                          Submit issues & track progress
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`text-gray-400 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      size={20}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                      >
                        <div className="p-3 bg-teal-50 border-l-4 border-l-teal-500">
                          <div className="flex items-center gap-3 p-2">
                            <div className="p-2 bg-teal-100 rounded-lg">
                              <User size={18} className="text-teal-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-teal-700">
                                Client Account
                              </p>
                              <p className="text-xs text-teal-600">
                                For submitting and tracking issues
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500 text-center">
                            Need staff/admin access?{" "}
                            <Link
                              to="/request-access"
                              className="text-teal-600 font-semibold"
                            >
                              Request access
                            </Link>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input type="hidden" {...register("role")} />
              </div>

              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    {...register("first_name", {
                      required: "First name is required",
                    })}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    disabled={isSubmitting}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    {...register("last_name", {
                      required: "Last name is required",
                    })}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    disabled={isSubmitting}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail size={14} className="text-teal-600" />
                  Email Address
                </label>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock size={14} className="text-teal-600" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: 8,
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                      disabled={isSubmitting}
                    />
                    <Lock
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword", {
                        required: "Please confirm password",
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords don't match",
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                      disabled={isSubmitting}
                    />
                    <Lock
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("terms", { required: "You must accept terms" })}
                  className="h-4 w-4 text-teal-600 mt-1"
                />
                <label className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-teal-600 font-medium">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-teal-600 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm">{errors.terms.message}</p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </motion.button>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <Lock size={12} className="text-teal-500" />
                <span>Your information is securely encrypted</span>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-teal-600 hover:text-teal-800"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
