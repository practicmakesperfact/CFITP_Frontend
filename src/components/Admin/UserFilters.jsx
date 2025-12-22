
import { Search, Filter, ChevronDown } from "lucide-react";

export default function UserFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] cursor-pointer hover:bg-gray-100 transition"
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="staff">Staff</option>
              <option value="manager">Managers</option>
              <option value="admin">Admins</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-4 pointer-events-none text-gray-500"
              size={20}
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] cursor-pointer hover:bg-gray-100 transition"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-4 pointer-events-none text-gray-500"
              size={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
