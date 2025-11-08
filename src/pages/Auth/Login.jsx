import { useForm } from "react-hook-form";
import { authApi } from "../../api/authApi.js";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (res) => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-teal-700"
    >
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          CFITP Login
        </h1>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full p-4 border rounded-lg mb-4"
            required
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full p-4 border rounded-lg mb-6"
            required
          />
          <button type="submit" className="w-full btn-primary py-3 text-lg">
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-6 text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-primary font-semibold">
            Register
          </a>
        </p>
      </div>
    </motion.div>
  );
}
