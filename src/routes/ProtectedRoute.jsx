import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUIStore } from "../app/store/uiStore";
import { authApi } from "../api/authApi";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const setUserRole = useUIStore((state) => state.setUserRole);
  const queryClient = useQueryClient();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (!token || token.startsWith("demo-")) {
        setIsAuthenticated(false);
        setIsLoading(false);

        // Clear any stale data
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        return;
      }

      try {
        const userRes = await authApi.me();
        const user = userRes.data;

        setUserRole(user.role);
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid or expired
        console.error("Auth verification failed:", error);

        // Clear everything
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_profile");

        // Clear React Query cache
        queryClient.clear();

        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [setUserRole, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-600 mx-auto" size={48} />
          <p className="mt-4 text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Clear any residual data
    queryClient.removeQueries({ queryKey: ["user-profile"] });

    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, redirected: true }}
        replace
      />
    );
  }

  return children;
}
