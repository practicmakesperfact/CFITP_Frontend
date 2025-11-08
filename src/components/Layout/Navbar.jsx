import { Bell, Menu, Moon, Sun, LogOut } from "lucide-react";
import { useUIStore } from "../../app/store/uiStore.js";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../../api/notificationsApi.js";
import { authApi } from "../../api/authApi.js";
import toast from "react-hot-toast";

export default function Navbar() {
  const { darkMode, toggleDarkMode, toggleSidebar } = useUIStore();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
    refetchInterval: 60000, // fallback polling
  });

  const unreadCount =
    notifications?.data?.filter((n) => !n.is_read).length || 0;

  const handleLogout = () => {
    authApi.logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-primary">CFITP</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
