
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi.js";

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: authApi.me,
    enabled: !!localStorage.getItem("access_token"),
  });

  const logout = () => {
    authApi.logout();
    navigate("/login");
  };

  return { user, isLoading, error, logout };
};
