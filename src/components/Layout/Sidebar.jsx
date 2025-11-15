import { NavLink } from "react-router-dom";
import {
  Home,
  Bug,
  MessageSquare,
  FileText,
  Bell,
  User,
  BarChart3,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/issues", icon: Bug, label: "Issues" },
  { to: "/feedback", icon: MessageSquare, label: "Feedback" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar({ isOpen }) {
  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-[#0EA5A4]/10 border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}
    >
      <div className="p-6">
        {isOpen && (
          <h2 className="font-bold text-xl text-[#0EA5A4]">CFITP Portal</h2>
        )}
      </div>

      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all 
               ${
                 isActive
                   ? "bg-[#0EA5A4] text-white shadow-sm"
                   : "hover:bg-[#0EA5A4]/20 text-slate-700"
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
