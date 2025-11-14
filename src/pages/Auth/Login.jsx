
// import { useForm } from "react-hook-form";
// import { useMutation } from "@tanstack/react-query";
// import { motion } from "framer-motion";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { authApi } from "../../api/authApi.js";
// import { Loader2 } from "lucide-react";

// export default function Login() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();
//   const navigate = useNavigate();

//   const mutation = useMutation({
//     mutationFn: authApi.login,
//     onSuccess: async (response) => {
//       const { access, refresh } = response.data;
//       localStorage.setItem("access_token", access);
//       localStorage.setItem("refresh_token", refresh);

//       const { data } = await authApi.me();
//       localStorage.setItem("user_role", data.role);
//       localStorage.setItem("user_profile", JSON.stringify(data));

//       toast.success(`Welcome back, ${data.first_name || "User"}!`);
//       navigate("/dashboard");
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.detail || "Invalid credentials");
//     },
//   });

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4"
//     >
//       <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
//         <h1 className="text-3xl font-bold text-primary text-center mb-8">
//           CFITP Login
//         </h1>

//         <form
//           onSubmit={handleSubmit((data) => mutation.mutate(data))}
//           className="space-y-5"
//         >
//           <div>
//             <label className="block text-sm font-medium text-text mb-2">
//               Email
//             </label>
//             <input
//               {...register("email", { required: "Email is required" })}
//               type="email"
//               placeholder="you@example.com"
//               className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
//             />
//             {errors.email && (
//               <p className="text-red-500 text-xs mt-1">
//                 {errors.email.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-text mb-2">
//               Password
//             </label>
//             <input
//               {...register("password", { required: "Password is required" })}
//               type="password"
//               placeholder="••••••••"
//               className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
//             />
//             {errors.password && (
//               <p className="text-red-500 text-xs mt-1">
//                 {errors.password.message}
//               </p>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={mutation.isPending}
//             className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl transition transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {mutation.isPending ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Logging in...
//               </>
//             ) : (
//               "Login"
//             )}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-sm text-text">
//           Don't have an account?{" "}
//           <Link
//             to="/register"
//             className="text-primary font-bold hover:underline"
//           >
//             Register
//           </Link>
//         </p>
//       </div>
//     </motion.div>
//   );
// }

// src/pages/Auth/Login.jsx
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi.js";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      const { data } = await authApi.me();
      toast.success(`Welcome, ${data.first_name}!`);
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4"
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-primary text-center mb-8">CFITP Login</h1>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Email</label>
            <input
              {...register("email", { required: "Required" })}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Password</label>
            <input
              {...register("password", { required: "Required" })}
              type="password"
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Use: <code>123456</code></p>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl transition transform hover:scale-105 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
}