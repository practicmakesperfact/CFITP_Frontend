
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Bug,
  MessageSquare,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";
import { useUIStore } from "../../app/store/uiStore.js";
import Footer from "./Footer";
import toast from "react-hot-toast";
import { useAuth } from "../../app/hooks.js";
import NotificationBell from "../Notifications/NotificationBell";
export default function AppShell() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, userRole } = useUIStore();
  const currentPath = location.pathname;
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-[#0EA5A4]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const menuConfig = {
    client: [
      { path: "/app/dashboard/client", label: "Dashboard", icon: Home },
      { path: "/app/issues", label: "My Issues", icon: Bug },
      { path: "/app/feedback", label: "Feedback", icon: MessageSquare },
      { path: "/app/profile", label: "Profile", icon: User },
    ],

    staff: [
      { path: "/app/dashboard/staff", label: "Dashboard", icon: Home },
      { path: "/app/issues", label: "Assigned Issues", icon: Bug },
      { path: "/app/profile", label: "Profile", icon: User },
    ],

    manager: [
      { path: "/app/dashboard/manager", label: "Dashboard", icon: Home },
      { path: "/app/issues", label: "All Issues", icon: Bug },
      { path: "/app/reports", label: "Reports", icon: BarChart3 },
      { path: "/app/profile", label: "Profile", icon: User },
    ],

    admin: [
      { path: "/app/dashboard/admin", label: "Dashboard", icon: Home },
      { path: "/app/issues", label: "All Issues", icon: Bug },
      { path: "/app/reports", label: "Reports", icon: BarChart3 },
      { path: "/app/notifications", label: "Notifications", icon: Bell },
      { path: "/app/admin/users", label: "User Management", icon: Users }, // CHANGED THIS LINE
      { path: "/app/profile", label: "Profile", icon: User },
    ],
  };

  const menuItems = menuConfig[userRole] || menuConfig.client;

  const safeLogout = () => {
    // ONLY remove login data — KEEP ALL YOUR ISSUES, FEEDBACK, ETC.
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_profile");

    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-700">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[#0EA5A4]/10 border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="font-bold text-xl text-[#0EA5A4]">CFITP Portal</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[#0EA5A4]/20"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const active = currentPath.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                  active
                    ? "bg-[#0EA5A4] text-white shadow-sm"
                    : "hover:bg-[#0EA5A4]/20 text-slate-700"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={safeLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/20 text-red-500 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-[#0F172A] text-white px-6 py-4 shadow flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {menuItems.find((i) => currentPath.startsWith(i.path))?.label ||
              "CFITP"}
          </h2>
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
