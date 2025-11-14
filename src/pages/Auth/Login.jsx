import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi.js";

// MUST HAVE THIS LINE
export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      const { data } = await authApi.me();
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_profile", JSON.stringify(data));
      toast.success("Welcome back!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Invalid credentials"),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 px-4"
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-red-500">
          CFITP Login
        </h1>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <label className="block text-text text-sm font-semibold mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-white dark:bg-gray-800 text-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
            required
          />

          <label className="block text-text text-sm font-semibold mb-2">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl mb-6 bg-white dark:bg-gray-800 text-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
            required
          />

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl transition duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-500 font-bold hover:underline "
          >
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
