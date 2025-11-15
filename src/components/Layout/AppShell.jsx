// import { useUIStore } from "../../app/store/uiStore.js";
// import Navbar from "./Navbar.jsx";
// import Sidebar from "./Sidebar.jsx";

// export default function AppShell({ children }) {
//   const { sidebarOpen, darkMode } = useUIStore();

//   return (
//     <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
//       <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
//         <Sidebar isOpen={sidebarOpen} />
//         <div className="flex-1 flex flex-col">
//           <Navbar />
//           <main className="flex-1 overflow-y-auto p-6">{children}</main>
//         </div>
//       </div>
//     </div>
//   );
// }


import Footer from "./Footer.jsx";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/authApi.js";
import { 
  Home, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Bell, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/issues", label: "Issues", icon: MessageSquare },
  { path: "/feedback", label: "Feedback", icon: FileText },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/profile", label: "Profile", icon: User },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    authApi.logout();
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-primary/10 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <h1
              className={`font-bold text-2xl text-primary ${
                !sidebarOpen && "hidden"
              }`}
            >
              CFITP Portal
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-primary/20 transition"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20 text-text"
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-500 transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {menuItems.find((i) => i.path === currentPath)?.label || "CFITP"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-red-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-background">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
}