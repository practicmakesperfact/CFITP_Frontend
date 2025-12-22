
import { Users, UserCheck, Shield } from "lucide-react";

export default function UserStats({ users }) {
  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    clients: users.filter((u) => u.role === "client").length,
    staffManagers: users.filter((u) =>
      ["staff", "manager", "admin"].includes(u.role)
    ).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <Users className="text-[#0EA5A4]" size={32} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-slate-800">{stats.active}</p>
          </div>
          <UserCheck className="text-green-500" size={32} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Clients</p>
            <p className="text-3xl font-bold text-slate-800">{stats.clients}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 font-bold">C</span>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Staff/Managers</p>
            <p className="text-3xl font-bold text-slate-800">
              {stats.staffManagers}
            </p>
          </div>
          <Shield className="text-blue-500" size={32} />
        </div>
      </div>
    </div>
  );
}
