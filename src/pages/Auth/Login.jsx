
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi.js";
import { Loader2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useUIStore } from "../../app/store/uiStore.js";

// DEMO ACCOUNTS — HARDOCED FOR FRONTEND-ONLY LOGIN
const DEMO_ACCOUNTS = {
  "admin@cfitp.com": { password: "admin123", role: "admin" },
  "manager@cfitp.com": { password: "manager123", role: "manager" },
  "staff@cfitp.com": { password: "staff123", role: "staff" },
  "client@cfitp.com": { password: "client123", role: "client" },
};

export default function Login() {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("client");

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const account = Object.entries(DEMO_ACCOUNTS).find(
      ([_, v]) => v.role === role
    );
    if (account) {
      const [email, info] = account;
      setValue("email", email);
      setValue("password", info.password);
      toast.success(`Demo: ${email} / ${info.password}`, { duration: 5000 });
    }
  };

  const onSubmit = async (data) => {
    const { email, password } = data;

    // CHECK IF IT'S A DEMO ACCOUNT → BYPASS BACKEND
    if (DEMO_ACCOUNTS[email]?.password === password) {
      const role = DEMO_ACCOUNTS[email].role;

      // Fake tokens (mock values)
      localStorage.setItem("access_token", `mock-access-${Date.now()}`);
      localStorage.setItem("refresh_token", `mock-refresh-${Date.now()}`);
      localStorage.setItem("user_role", role);
      localStorage.setItem(
        "user_profile",
        JSON.stringify({
          email,
          first_name: role.charAt(0).toUpperCase() + role.slice(1),
          role,
        })
      );

      useUIStore.getState().setUserRole(role);
      window.dispatchEvent(new Event("roleChanged"));

      toast.success(`Welcome back, ${role.toUpperCase()}!`);
      navigate("/dashboard", { replace: true });
      return;
    }

    // ONLY IF NOT DEMO → TRY REAL BACKEND
    try {
      const response = await authApi.login(data);
      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      let finalRole = selectedRole;
      try {
        const { data: user } = await authApi.me();
        if (user?.role) finalRole = user.role;
        localStorage.setItem("user_profile", JSON.stringify(user));
      } catch (err) {}

      localStorage.setItem("user_role", finalRole);
      useUIStore.getState().setUserRole(finalRole);
      window.dispatchEvent(new Event("roleChanged"));

      toast.success(`Welcome back, ${finalRole.toUpperCase()}!`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <motion.div
       initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4" 
    >
      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-slate-800">
        <h1 className="text-5xl font-bold text-cyan-400 text-center mb-10">
          CFITP Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email
            </label>
            <input
              {...register("email", { required: true })}
              type="email"
              className="w-full px-5 py-4 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none transition"
              placeholder="admin@cfitp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Password
            </label>
            <input
              {...register("password", { required: true })}
              type="password"
              className="w-full px-5 py-4 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300 mb-2">
              Login as (Dev Mode)
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-5 py-4 bg-slate-800/60 border border-slate-700 rounded-xl text-white appearance-none cursor-pointer pr-12 transition"
              >
                <option value="client">Client</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-4 top-5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3"
          >
            Login
          </button>
        </form>

        <div className="mt-8 p-5 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-cyan-300 font-semibold mb-3">
            Demo Accounts (Auto-filled)
          </p>
          <div className="text-xs space-y-1 text-gray-300">
            <div>admin@cfitp.com → admin123</div>
            <div>manager@cfitp.com → manager123</div>
            <div>staff@cfitp.com → staff123</div>
            <div>client@cfitp.com → client123</div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            No account? Register (clients only)
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
