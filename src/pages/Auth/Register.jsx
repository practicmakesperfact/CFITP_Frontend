import { useForm } from "react-hook-form";
import { authApi } from "../../api/authApi.js";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Registration successful! Please login.");
      navigate("/login");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
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
            className="w-full p-4 border rounded-lg mb-4"
            required
          />
          <input
            {...register("first_name")}
            placeholder="First Name"
            className="w-full p-4 border rounded-lg mb-4"
          />
          <input
            {...register("last_name")}
            placeholder="Last Name"
            className="w-full p-4 border rounded-lg mb-6"
          />
          <button type="submit" className="w-full btn-primary py-3">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
