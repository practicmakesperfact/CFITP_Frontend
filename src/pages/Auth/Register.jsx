import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi.js";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await authApi.register(data);
      toast.success("Account created! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.email) toast.error(errData.email[0]);
      else if (errData?.password) toast.error(errData.password[0]);
      else if (errData?.role) toast.error(errData.role[0]);
      else toast.error("Registration failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-bold text-center text-teal-600 mb-10">
          Create Account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            placeholder="Email"
            className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <input
            {...register("password", {
              required: "Password required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            })}
            type="password"
            placeholder="Password"
            className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <input
            {...register("first_name", { required: "First name required" })}
            placeholder="First Name"
            className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 outline-none"
          />

          <input
            {...register("last_name", { required: "Last name required" })}
            placeholder="Last Name"
            className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 outline-none"
          />

          {/* THIS IS THE ONLY NEW THING */}
          <select
            {...register("role", { required: "Please select your role" })}
            className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 outline-none"
          >
            <option value="">Choose your role</option>
            <option value="client">Client (Customer)</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-xl font-bold text-xl transition"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
