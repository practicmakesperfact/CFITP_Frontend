import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi.js";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Use React Query to cache user data
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const response = await authApi.me();
        return response.data;
      } catch (error) {
        // If error, clear tokens and return null
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return null;
      }
    },
    enabled: !!localStorage.getItem("access_token"),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    try {
      // Clear React Query cache FIRST
      queryClient.clear();

      // Call API logout
      await authApi.logout();

      // Clear all local storage
      localStorage.clear();

      toast.success("Logged out successfully");

      // Force hard redirect to clear memory
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear everything
      queryClient.clear();
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return {
    user,
    isLoading,
    logout,
    refetch,
    isAuthenticated: !!localStorage.getItem("access_token"),
  };
};
