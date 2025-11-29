
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi.js";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsLoading(false);
      setUser(null);
      return;
    }

    // Fetch user profile
    authApi
      .me()
      .then((res) => {
        setUser(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        // Token invalid → clear everything
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_profile");
        setUser(null);
        setIsLoading(false);
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_profile");
    setUser(null);
    toast.success("Logged out");
    // navigate("/login", { replace: true });
  };

  return { user, isLoading, logout };
};
