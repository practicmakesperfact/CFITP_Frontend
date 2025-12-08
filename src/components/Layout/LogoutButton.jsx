
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../app/store/uiStore";
import { authApi } from "../../api/authApi";

export default function LogoutButton() {
  const navigate = useNavigate();
  const clearAuth = useUIStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearAuth();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}
