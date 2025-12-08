// src/pages/Auth/RequestAccess.jsx
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  Phone,
  Briefcase,
  ChevronDown,
  Shield,
  Send,
  Loader2,
  Users,
  Sparkles,
} from "lucide-react";

// Import images
import companyBackground from "../../assets/company-background.jpg";
import anrsLogo from "../../assets/image.jpg";

// Role options for employee access
const ROLE_OPTIONS = [
  {
    value: "staff",
    label: "Support Staff",
    icon: <Users size={20} />,
    description: "Resolve and manage issues",
    color: "from-blue-500 to-blue-600",
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Briefcase size={20} />,
    description: "Team oversight and reporting",
    color: "from-purple-500 to-purple-600",
  },
  {
    value: "admin",
    label: "Administrator",
    icon: <Shield size={20} />,
    description: "System administration",
    color: "from-red-500 to-red-600",
  },
];

export default function RequestAccess() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: "staff",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      jobTitle: "",
      reason: "",
      terms: false,
    },
  });

  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dropdownRef = useRef(null);
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

  const onSubmit = async (data) => {
    try {
      // Store request
      const existingRequests = JSON.parse(
        localStorage.getItem("access_requests") || "[]"
      );
      localStorage.setItem(
        "access_requests",
        JSON.stringify([
          ...existingRequests,
          {
            ...data,
            id: Date.now(),
            status: "pending",
            submittedAt: new Date().toISOString(),
          },
        ])
      );

      toast.success("Access request submitted!");
      setIsSubmitted(true);

      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      toast.error("Failed to submit request.");
    }
  };

  const handleRoleSelect = (role) => {
    setValue("role", role);
    setDropdownOpen(false);
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
              Employee
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">
                Access Request
              </span>
            </h2>

            <p className="text-teal-100 text-lg mb-10 leading-relaxed">
              Request access to the internal portal for ANRS employees.
            </p>

            {/* Process */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="p-2 bg-teal-500/30 rounded-lg">
                  <span className="font-bold text-teal-200">1</span>
                </div>
                <div>
                  <p className="font-medium">Submit Request</p>
                  <p className="text-teal-200/90 text-sm">
                    Complete the form below
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="p-2 bg-teal-500/30 rounded-lg">
                  <span className="font-bold text-teal-200">2</span>
                </div>
                <div>
                  <p className="font-medium">Admin Review</p>
                  <p className="text-teal-200/90 text-sm">
                    IT administrators review
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20">
            <p className="text-teal-200/80 text-sm">
              For client registration?{" "}
              <Link
                to="/register"
                className="text-white font-semibold hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right side - Request Form */}
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

          {/* Request Card */}
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
                Request Employee Access
              </h2>
              <p className="text-gray-600">
                Fill in your details for access review
              </p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="text-green-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Request Submitted
                </h3>
                <p className="text-gray-600 mb-8">
                  Your access request has been submitted for administrative
                  review.
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <p className="text-sm text-gray-600">
                    You will receive an email notification once approved.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Role Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase size={14} className="text-teal-600" />
                    Requested Role
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                          {selectedRole.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {selectedRole.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedRole.description}
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
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => handleRoleSelect(role.value)}
                              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                watchedRole === role.value
                                  ? "bg-teal-50 border-l-4 border-l-teal-500"
                                  : "border-l-4 border-l-transparent"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-lg ${
                                  watchedRole === role.value
                                    ? "bg-teal-100 text-teal-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {role.icon}
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900">
                                  {role.label}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {role.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input
                    type="hidden"
                    {...register("role", { required: true })}
                  />
                </div>

                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      placeholder="John"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail size={14} className="text-teal-600" />
                     Email
                  </label>
                  <input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    placeholder="test.doe@gmail.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone size={14} className="text-teal-600" />
                    Phone Number
                  </label>
                  <input
                    {...register("phone", { required: "Phone is required" })}
                    placeholder="+251 901222211"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Organization */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building size={14} className="text-teal-600" />
                      Department
                    </label>
                    <select
                      {...register("department", {
                        required: "Department is required",
                      })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    >
                      <option value="">Select Department</option>
                      {[
                        "IT",
                        "Support",
                        "QA",
                        "R&D",
                        "Operations",
                        "HR",
                        "Finance",
                        "Other",
                      ].map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-sm">
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Briefcase size={14} className="text-teal-600" />
                      Job Title
                    </label>
                    <input
                      {...register("jobTitle", {
                        required: "Job title is required",
                      })}
                      placeholder="Software Engineer"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm">
                        {errors.jobTitle.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reason for Access
                  </label>
                  <textarea
                    {...register("reason", { required: "Reason is required" })}
                    rows={3}
                    placeholder="Briefly explain why you need access..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm">
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    {...register("terms", {
                      required: "You must accept terms",
                    })}
                    className="h-4 w-4 text-teal-600 mt-1"
                  />
                  <label className="text-sm text-gray-600">
                    I agree to comply with security policies
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
                    <Send size={20} />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </motion.button>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Shield size={12} className="text-teal-500" />
                  <span>All requests require administrative approval</span>
                </div>
              </form>
            )}

            {/* Alternative Links */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600">
                Need client access?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-teal-600 hover:text-teal-800"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
