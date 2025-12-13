// src/pages/Dashboards/ManagerDashboard.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserCog,
  ClipboardCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  Users,
  UserCheck,
} from "lucide-react";
import { subDays, isWithinInterval, formatDistanceToNow } from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { issuesApi } from "../../api/issuesApi";
import { usersApi } from "../../api/usersApi";
import { useAuth } from "../../app/hooks";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChartCard from "../../components/Dashboard/ChartCard";
import AssignModal from "../../components/Issues/AssignModal";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [assignData, setAssignData] = useState(null);
  const [timeFilter, setTimeFilter] = useState("month");

  // Load ALL client feedback
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const loadFeedback = () => {
      const data = JSON.parse(localStorage.getItem("cfitp_feedback") || "[]");
      setFeedback(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };
    loadFeedback();
    window.addEventListener("storage", loadFeedback);
    return () => window.removeEventListener("storage", loadFeedback);
  }, []);

  // Fetch all issues - FIXED: Properly defined issuesData
  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ["issues-all"],
    queryFn: () => issuesApi.listAll(),
  });

  // Fetch REAL staff users from backend
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["staff-users"],
    queryFn: async () => {
      try {
        // Try to fetch staff users from your backend
        const response = await usersApi.getStaffUsers();
        return response.data;
      } catch (error) {
        console.error("Failed to fetch staff users:", error);
        // Fallback: Check if we have any users in localStorage or return empty
        const fallbackUsers = JSON.parse(
          localStorage.getItem("cfitp_users") || "[]"
        );
        return fallbackUsers.filter((user) => user.role === "staff");
      }
    },
  });

  const markAsRead = (id) => {
    const updated = feedback.map((f) =>
      f.id === id ? { ...f, read: true } : f
    );
    localStorage.setItem("cfitp_feedback", JSON.stringify(updated));
    setFeedback(updated);
  };

  // FIXED: Properly handle issuesData which might be undefined during loading
  const issues = issuesData?.results || [];
  const staffUsers = staffData || [];

  // Filter issues based on time filter
  const getFilteredIssues = () => {
    const now = new Date();
    return issues.filter((issue) => {
      const date = new Date(issue.created_at);
      const timeDiff = now - date;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      if (timeFilter === "today") return daysDiff <= 1;
      if (timeFilter === "week") return daysDiff <= 7;
      if (timeFilter === "month") return daysDiff <= 30;
      return true;
    });
  };

  const filteredIssues = getFilteredIssues();

  const open = filteredIssues.filter((i) => i.status === "open").length;
  const inProgress = filteredIssues.filter(
    (i) => i.status === "in-progress" || i.status === "in_progress"
  ).length;
  const resolved = filteredIssues.filter((i) =>
    ["resolved", "closed"].includes(i.status)
  ).length;

  const unassignedIssues = filteredIssues.filter((i) => !i.assignee_email);
  const assignedIssues = filteredIssues.filter((i) => i.assignee_email);

  const pieData = {
    series: [open, inProgress, resolved],
    labels: ["Open", "In Progress", "Resolved"],
  };

  const weeklyData = () => {
    const dayCounts = Array(7).fill(0);
    filteredIssues.forEach((issue) => {
      const day = new Date(issue.created_at).getDay();
      dayCounts[day] += 1;
    });
    return {
      series: [{ name: "Issues", data: dayCounts }],
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  };

  const handleAssigned = () => {
    toast.success("Staff assigned successfully");
    setAssignData(null);
    queryClient.invalidateQueries({ queryKey: ["issues-all"] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Welcome back, {user?.first_name || "Manager"}!
          </h1>
          <p className="text-slate-600 mt-2">Team management and oversight</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
            <Users className="text-[#0EA5A4]" size={20} />
            <span className="font-medium text-slate-700">
              {staffUsers.length} Staff Members
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
            <UserCog className="text-[#0EA5A4]" size={24} />
            <span className="font-medium text-slate-700">
              {user?.first_name || user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex justify-end">
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] cursor-pointer hover:bg-gray-50 transition"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDown
            className="absolute right-4 top-4 pointer-events-none text-gray-500"
            size={20}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Open Issues"
          value={open}
          icon={AlertCircle}
          color="red"
        />
        <KpiCard
          title="In Progress"
          value={inProgress}
          icon={Clock}
          color="amber"
        />
        <KpiCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle}
          color="emerald"
        />
        <KpiCard
          title="Assigned Issues"
          value={assignedIssues.length}
          icon={UserCheck}
          color="teal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Issue Status Overview" type="line" data={pieData} />
        <ChartCard title="Issues This Week" type="line" data={weeklyData()} />
      </div>

      {/* Unassigned Issues Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Unassigned Issues ({unassignedIssues.length})
          </h2>
          {unassignedIssues.length > 4 && (
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <ChevronDown size={16} />
              Scroll to see more
            </p>
          )}
        </div>

        {unassignedIssues.length === 0 ? (
          <div className="text-center py-16">
            <Lottie animationData={emptyAnimation} className="w-64 mx-auto" />
            <p className="text-slate-600 mt-4 text-lg">No unassigned issues</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {unassignedIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ x: 8 }}
                className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Created by {issue.reporter_email} •{" "}
                    {formatDistanceToNow(new Date(issue.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAssignData(issue)}
                    className="px-5 py-2 rounded-xl bg-[#0EA5A4] text-white hover:bg-teal-700 font-medium shadow transition-all hover:scale-105"
                  >
                    Assign Staff
                  </button>
                  <button
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Assigned Issues */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Recently Assigned ({assignedIssues.length})
          </h2>
          {assignedIssues.length > 4 && (
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <ChevronDown size={16} />
              Scroll to see more
            </p>
          )}
        </div>

        {assignedIssues.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            No assigned issues yet...
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {assignedIssues.slice(0, 10).map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ x: 10 }}
                className="p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-800">
                      {issue.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Assigned to <strong>{issue.assignee_email}</strong> •{" "}
                      {formatDistanceToNow(new Date(issue.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in-progress" || issue.status === "in_progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {issue.status.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignData && (
        <AssignModal
          issue={assignData}
          staffUsers={staffUsers}
          onClose={() => setAssignData(null)}
          onAssign={handleAssigned}
        />
      )}
    </motion.div>
  );
}
