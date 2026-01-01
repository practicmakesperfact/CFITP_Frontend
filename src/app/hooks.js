
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi.js";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const navigate = useNavigate();

  // Use React Query to cache user data
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authApi.me().then((res) => res.data),
    enabled: !!localStorage.getItem("access_token"),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    authApi.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_profile");
    toast.success("Logged out");
  };

  return {
    user,
    isLoading,
    logout,
    refetch: () => {
      queryClient.invalidateQueries(["user-profile"]);
    },
  };
};
