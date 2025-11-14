
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuth } from "../../app/hooks.js";
import toast from "react-hot-toast";

export default function ProfileEdit() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = (data) => {
    localStorage.setItem("user_profile", JSON.stringify({ ...user, ...data }));
    toast.success("Profile updated!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-text mb-8">Edit Profile</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            First Name
          </label>
          <input
            {...register("first_name", { required: "Required" })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text focus:ring-2 focus:ring-primary"
          />
          {errors.first_name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Last Name
          </label>
          <input
            {...register("last_name", { required: "Required" })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Email
          </label>
          <input
            {...register("email", { required: "Required" })}
            type="email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl transition"
        >
          Save Changes
        </button>
      </form>
    </motion.div>
  );
}
