
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Bug,
  MessageSquare,
  FileText,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";
import { useState } from "react";
import Footer from "./Footer";
import { useUIStore } from "../../app/store/uiStore.js"; // ← Add

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, userRole } = useUIStore(); // ← Get role
  const currentPath = location.pathname;

  // Define all possible menu items
  const allMenuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["client", "staff", "manager", "admin"],
    },
    {
      path: "/issues",
      label: "Issues",
      icon: Bug,
      roles: ["staff", "manager", "admin"],
    },
    {
      path: "/feedback",
      label: "Feedback",
      icon: MessageSquare,
      roles: ["admin"],
    },
    {
      path: "/reports",
      label: "Reports",
      icon: BarChart3,
      roles: ["manager", "admin"],
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: Bell,
      roles: ["admin"],
    },
    { path: "/users", label: "Users", icon: Users, roles: ["admin"] }, // ← New for Admin
    {
      path: "/profile",
      label: "Profile",
      icon: User,
      roles: ["client", "staff", "manager", "admin"],
    },
  ];

  // Filter based on role
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-700">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[#0EA5A4]/10 border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all
                  ${
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
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/20 text-red-500 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between shadow">
          <h2 className="text-lg font-semibold">
            {menuItems.find((i) => currentPath.startsWith(i.path))?.label ||
              "CFITP"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg">
              <Bell size={20} />
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="p-2 hover:bg-gray-800 rounded-lg text-red-400"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
