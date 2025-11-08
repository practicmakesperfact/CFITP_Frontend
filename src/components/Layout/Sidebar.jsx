import {
  Home,
  Bug,
  MessageSquare,
  FileText,
  Bell,
  User,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUIStore } from "../../app/store/uiStore.js";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/issues", icon: Bug, label: "Issues" },
  { to: "/feedback", icon: MessageSquare, label: "Feedback" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar({ isOpen }) {
  const role = localStorage.getItem("user_role");

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-primary text-white transition-all duration-300 flex flex-col`}
    >
      <div className="p-6">
        <h2 className={`font-bold text-xl ${!isOpen && "hidden"}`}>
          CFITP Portal
        </h2>
      </div>
      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive ? "bg-white/20" : "hover:bg-white/10"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
