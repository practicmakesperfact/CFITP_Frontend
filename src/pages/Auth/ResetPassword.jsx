
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { authApi } from "../../api/authApi.js";

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await authApi.resetPassword(data.email);
      toast.success("Password reset link sent!");
    } catch {
      toast.error("Email not found");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border">
        <h1 className="text-4xl font-bold text-center text-[#0EA5A4] mb-10">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input
            {...register("email", { required: "Email required" })}
            type="email"
            placeholder="Enter your email"
            className="w-full px-5 py-4 border rounded-xl focus:border-[#0EA5A4]"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0EA5A4] hover:bg-teal-700 text-white py-5 rounded-xl font-bold text-xl flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
