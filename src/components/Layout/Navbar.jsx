import { Bell, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();

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
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-3 py-2 rounded"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
