
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUIStore } from "../app/store/uiStore";
import { authApi } from "../api/authApi";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const setUserRole = useUIStore((state) => state.setUserRole);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (!token || token.startsWith("demo-")) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const userRes = await authApi.me();
        const user = userRes.data;

        setUserRole(user.role);
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_profile");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [setUserRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home page (not login) when not authenticated
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return children;
}
