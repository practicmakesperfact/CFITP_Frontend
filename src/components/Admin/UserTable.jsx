
import { useState } from "react";
import {
  Edit,
  Trash2,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";

export default function UserTable({
  users,
  selectedUsers,
  setSelectedUsers,
  onEdit,
  onDelete,
  onToggleStatus,
  currentUserId,
}) {
  // Get role badge color
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "manager":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "staff":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "client":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format user name
  const formatUserName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    }
    return "No name provided";
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (user.first_name?.[0] && user.last_name?.[0]) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    } else if (user.first_name?.[0]) {
      return user.first_name[0].toUpperCase();
    } else if (user.last_name?.[0]) {
      return user.last_name[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200">
        <Lottie animationData={emptyAnimation} className="w-72 mx-auto" />
        <p className="text-slate-600 mt-4 text-lg">No users found</p>
      </div>
    );
  }

  const allSelected = users.length > 0 && selectedUsers.length === users.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(users.map((u) => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  className="rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                />
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Role
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Last Login
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Joined
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((id) => id !== user.id)
                        );
                      }
                    }}
                    className="rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                  />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0EA5A4] to-[#FB923C] flex items-center justify-center text-white font-bold">
                      {getUserInitials(user)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {formatUserName(user)}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail size={12} />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                      user.role
                    )}`}
                  >
                    <Shield size={12} className="mr-1" />
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) ||
                      "Unknown"}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => onToggleStatus(user.id, user.is_active)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition ${
                      user.is_active
                        ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200"
                        : "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                    }`}
                  >
                    {user.is_active ? (
                      <>
                        <UserCheck size={12} className="mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX size={12} className="mr-1" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {user.last_login
                    ? format(new Date(user.last_login), "MMM d, yyyy HH:mm")
                    : "Never"}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {format(
                      new Date(user.date_joined || user.created_at),
                      "MMM d, yyyy"
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit user"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      disabled={user.id === currentUserId}
                      className={`p-2 rounded-lg transition ${
                        user.id === currentUserId
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                      title={
                        user.id === currentUserId
                          ? "Cannot delete yourself"
                          : "Delete user"
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
