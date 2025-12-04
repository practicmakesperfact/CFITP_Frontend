import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import { useUIStore } from "../../app/store/uiStore.js";
import { authApi } from "../../api/authApi.js";

const DEMO_ACCOUNTS = {
  "admin@cfitp.com": { password: "admin123", role: "admin" },
  "manager@cfitp.com": { password: "manager123", role: "manager" },
  "staff@cfitp.com": { password: "staff123", role: "staff" },
  "client@cfitp.com": { password: "client123", role: "client" },
};

export default function Login() {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const setUserRole = useUIStore((state) => state.setUserRole);

  const onSubmit = async (data) => {
    const { email, password } = data;

    // DEMO MODE (optional – remove if you don’t want it)
    if (DEMO_ACCOUNTS[email]?.password === password) {
      const role = DEMO_ACCOUNTS[email].role;
      localStorage.setItem("access_token", `demo-${Date.now()}`);
      localStorage.setItem("refresh_token", "demo");
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_profile", JSON.stringify({ email, role }));
      setUserRole(role);
      toast.success(`Demo Login: ${role.toUpperCase()}`);
      navigate("/dashboard", { replace: true });
      return;
    }

    // REAL LOGIN
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      const userRes = await authApi.me();
      const user = userRes.data;
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_profile", JSON.stringify(user));
      setUserRole(user.role);

      toast.success(`Welcome, ${user.role.toUpperCase()}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error("Invalid email or password");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-5xl font-bold text-center text-teal-600 mb-10">
          CFITP Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="Email"
            className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 outline-none"
          />
          <input
            {...register("password", { required: true })}
            type="password"
            placeholder="Password"
            className="w-full px-5 py-4 border rounded-xl focus:border-teal-600 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-xl font-bold text-xl transition"
          >
            Login
          </button>
        </form>
        <select
          {...register("role", { required: "Please select your role" })}
          className="w-full px-5 py-4 mt-6 border rounded-xl focus:border-teal-500 outline-none"
        >
         
          <option value="client">Client (Customer)</option>
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      

        <p className="text-center mt-8">
          No account?{" "}
          <Link
            to="/register"
            className="text-teal-600 font-bold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
