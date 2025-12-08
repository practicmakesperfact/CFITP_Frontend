import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  User,
  Briefcase,
  Users,
  Shield,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { authApi } from "../../api/authApi.js";

// Role options
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
    disabled: true,
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Users size={16} />,
    description: "Manage team & reports",
    disabled: true,
  },
  {
    value: "admin",
    label: "Admin",
    icon: <Shield size={16} />,
    description: "System administration",
    disabled: true,
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
  const [selectedRole, setSelectedRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data) => {
  setApiError(null);
  
  // Client-side validation
  if (data.password !== data.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (!data.terms) {
    toast.error("You must accept the terms and conditions");
    return;
  }

  console.log("Form data before transformation:", data);

  try {
    // Prepare data for backend (camelCase to snake_case)
    const backendData = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      role: data.role,
      confirm_password: data.confirmPassword, // Key fix: snake_case
    };

    console.log("Sending to backend:", backendData);

    const response = await authApi.register(backendData);
    
    console.log("Registration response:", response.data);
    
    // Clear any stored tokens (just in case)
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_profile");
    
    // Show success message
    toast.success(
      <div>
        <p className="font-bold">Account created successfully!</p>
        <p className="text-sm">Please login with your credentials.</p>
      </div>,
      { duration: 4000 }
    );
    
    // REDIRECT TO LOGIN PAGE, NOT DASHBOARD
    setTimeout(() => navigate("/login"), 2000);
    
  } catch (err) {
    console.error("Registration error details:", err.response?.data);
    
    const errData = err.response?.data || {};
    setApiError(errData);
    
    // Handle specific field errors
    if (errData.email) {
      toast.error(`Email: ${Array.isArray(errData.email) ? errData.email[0] : errData.email}`);
    } else if (errData.password) {
      toast.error(`Password: ${Array.isArray(errData.password) ? errData.password[0] : errData.password}`);
    } else if (errData.confirm_password) {
      toast.error(`Confirm Password: ${Array.isArray(errData.confirm_password) ? errData.confirm_password[0] : errData.confirm_password}`);
    } else if (errData.role) {
      toast.error(`Role: ${Array.isArray(errData.role) ? errData.role[0] : errData.role}`);
    } else if (errData.non_field_errors) {
      toast.error(Array.isArray(errData.non_field_errors) ? errData.non_field_errors[0] : errData.non_field_errors);
    } else if (errData.detail) {
      toast.error(errData.detail);
    } else {
      toast.error("Registration failed. Please check your information and try again.");
    }
  }
};

  const handleRoleSelect = (role) => {
    if (ROLE_OPTIONS.find((r) => r.value === role)?.disabled) {
      toast.error(
        "Staff, Manager, and Admin roles can only be assigned by existing administrators."
      );
      return;
    }
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
          <h1 className="text-4xl font-bold text-teal-600 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join our feedback portal</p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Account Type
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
                } ${
                  roleOption.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={roleOption.disabled}
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
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-medium">Note:</span> Client accounts can be
            self-registered. Staff/Manager/Admin roles require administrator
            approval.
          </p>
          <input
            type="hidden"
            {...register("role", { required: "Please select a role" })}
          />
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm font-medium">
              Server Validation Errors:
            </p>
            <ul className="mt-2 text-red-600 text-sm">
              {Object.entries(apiError).map(([field, errors]) => (
                <li key={field}>
                  {field}: {Array.isArray(errors) ? errors[0] : errors}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                {...register("first_name", {
                  required: "First name is required",
                  minLength: { value: 2, message: "Minimum 2 characters" },
                  maxLength: { value: 50, message: "Maximum 50 characters" },
                })}
                placeholder="John"
                className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition"
                disabled={isSubmitting}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                {...register("last_name", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "Minimum 2 characters" },
                  maxLength: { value: 50, message: "Maximum 50 characters" },
                })}
                placeholder="Doe"
                className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition"
                disabled={isSubmitting}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
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
              placeholder="john.doe@example.com"
              className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Minimum 8 characters" },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Include uppercase, lowercase, number & special character",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition pr-12"
                  disabled={isSubmitting}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition pr-12"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              {...register("terms", {
                required: "You must accept the terms and privacy policy",
              })}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-teal-600 hover:underline font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-teal-600 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-sm">{errors.terms.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-5 rounded-xl font-bold text-xl transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating {selectedRole} account...
              </>
            ) : (
              `Create ${
                selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
              } Account`
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-bold hover:text-teal-800 hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Password requirements */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">
              Password Requirements:
            </p>
            <ul className="text-xs text-gray-500 space-y-0.5">
              <li>• Minimum 8 characters</li>
              <li>• At least one uppercase letter</li>
              <li>• At least one lowercase letter</li>
              <li>• At least one number</li>
              <li>• At least one special character (@$!%*?&)</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
