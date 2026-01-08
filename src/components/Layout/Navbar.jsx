import { Bell, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { performLogout } from "../../utils/logoutHelper"; // Import the logout helper

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Use the performLogout function which clears everything
      await performLogout({
        showToast: true,
        redirectToLogin: true,
        clearCache: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Emergency cleanup
      localStorage.clear();
      if (window.queryClient) {
        window.queryClient.clear();
      }
      window.location.href = "/login";
    }
  };

  return (
    <header className="bg-[#0F172A] text-white px-6 py-4 shadow flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden">
          <Menu size={22} />
        </button>
        <h1 className="text-xl font-semibold">CFITP Portal</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-gray-800">
          <Bell size={20} />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-3 py-2 rounded"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
