// src/pages/Auth/Login.jsx
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
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
} from "lucide-react";

// Role options with icons
const ROLE_OPTIONS = [
  {
    value: "client",
    label: "Client",
    icon: <User size={16} />,
    description: "Submit issues & track progress",
  },
  {
    value: "staff",
    label: "Staff",
    icon: <Briefcase size={16} />,
    description: "Resolve assigned issues",
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Users size={16} />,
    description: "Manage team & reports",
  },
  {
    value: "admin",
    label: "Admin",
    icon: <Shield size={16} />,
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
  const [selectedRole, setSelectedRole] = useState("client");

  const from = location.state?.from?.pathname || "/dashboard";
  const watchedRole = watch("role");

  useEffect(() => {
    setSelectedRole(watchedRole);
  }, [watchedRole]);

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
    setSelectedRole(role);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">CFITP Login</h1>
          <p className="text-gray-600">Select your role to continue</p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Login Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ROLE_OPTIONS.map((roleOption) => (
              <button
                key={roleOption.value}
                type="button"
                onClick={() => handleRoleSelect(roleOption.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  selectedRole === roleOption.value
                    ? "border-teal-600 bg-teal-50 shadow-md"
                    : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    selectedRole === roleOption.value
                      ? "bg-teal-100 text-teal-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {roleOption.icon}
                </div>
                <span className="font-medium text-sm">{roleOption.label}</span>
                <span className="text-xs text-gray-500 text-center">
                  {roleOption.description}
                </span>
              </button>
            ))}
          </div>
          <input
            type="hidden"
            {...register("role", { required: "Please select a role" })}
          />
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="you@example.com"
              className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition"
              disabled={isSubmitting || isLocked}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition pr-12"
                disabled={isSubmitting || isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <Link
              to="/reset-password"
              className="text-sm text-teal-600 hover:text-teal-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-5 rounded-xl font-bold text-xl transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in as {selectedRole}...
              </>
            ) : isLocked ? (
              "Account Locked"
            ) : (
              `Sign In as ${
                selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
              }`
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-teal-600 font-bold hover:text-teal-800 hover:underline"
            >
              Sign up
            </Link>
          </p>

          {/* Security note */}
          <p className="text-xs text-center text-gray-500 mt-4">
            <i className="fas fa-shield-alt mr-1"></i>
            Your security is our priority. All data is encrypted.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
