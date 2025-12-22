// components/Dashboard/DashboardRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../app/store/uiStore";
import { authApi } from "../../api/authApi";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const setUserRole = useUIStore((state) => state.setUserRole);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.me();
        const user = res.data;

        setUserRole(user.role);
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("user_profile", JSON.stringify(user));

        // Redirect to correct dashboard
        navigate(`/app/dashboard/${user.role}`, { replace: true });
      } catch (err) {
        console.error("Auth failed", err);
        // Redirect to home page (not login) when auth fails
        navigate("/", { replace: true });
      }
    };

    fetchUser();
  }, [navigate, setUserRole]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
