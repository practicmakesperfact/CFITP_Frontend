import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate
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
  Filter,
  TrendingUp,
  BarChart3,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  subDays,
  formatDistanceToNow,
  format,
  eachDayOfInterval,
} from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { issuesApi } from "../../api/issuesApi";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../app/hooks";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChartCard from "../../components/Dashboard/ChartCard";
import AssignModal from "../../components/Issues/AssignModal";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ManagerDashboard() {
  const navigate = useNavigate(); // Make sure this is defined
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [assignData, setAssignData] = useState(null);
  const [timeFilter, setTimeFilter] = useState("month");

  // Fetch all issues
  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ["issues-all"],
    queryFn: () => issuesApi.listAll(),
  });

  // **FIXED: Use SAME endpoint as IssueDetailPage**
  const { data: staffData = [], isLoading: staffLoading } = useQuery({
    queryKey: ["staff-users-dashboard"],
    queryFn: async () => {
      try {
        console.log("🔄 Fetching staff users for dashboard...");
        const response = await axiosClient.get("/users/");

        // Handle different response formats (SAME as IssueDetailPage)
        const data = response.data;
        let users = [];

        if (data && data.results) {
          users = data.results;
        } else if (Array.isArray(data)) {
          users = data;
        } else {
          console.error("Unexpected API response format:", data);
          return [];
        }

        console.log(`📋 Total users from API: ${users.length}`);

        // **CRITICAL: Filter ONLY staff users (not managers) - SAME FILTER**
        const staffOnly = users.filter((u) => {
          const isStaff = u.role === "staff" && u.is_active !== false;
          if (!isStaff && u.role) {
            console.log(`❌ Filtered out (not staff): ${u.email} (${u.role})`);
          }
          return isStaff;
        });

        console.log(`✅ Found ${staffOnly.length} staff users for dashboard`);
        return staffOnly;
      } catch (error) {
        console.error("❌ Error fetching staff users:", error);
        toast.error("Failed to load staff list");
        return [];
      }
    },
    staleTime: 60000,
  });

  // Handle issues data
  const issues = issuesData?.results || [];

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

  // Calculate KPIs
  const open = filteredIssues.filter((i) => i.status === "open").length;
  const inProgress = filteredIssues.filter(
    (i) => i.status === "in-progress" || i.status === "in_progress"
  ).length;
  const resolved = filteredIssues.filter((i) =>
    ["resolved", "closed"].includes(i.status)
  ).length;

  const totalIssues = open + inProgress + resolved;

  // Calculate percentages for pie chart
  const openPercent =
    totalIssues > 0 ? Math.round((open / totalIssues) * 100) : 0;
  const inProgressPercent =
    totalIssues > 0 ? Math.round((inProgress / totalIssues) * 100) : 0;
  const resolvedPercent =
    totalIssues > 0 ? Math.round((resolved / totalIssues) * 100) : 0;

  const unassignedIssues = filteredIssues.filter(
    (i) => !i.assignee && !i.assignee_email
  );
  const assignedIssues = filteredIssues.filter(
    (i) => i.assignee || i.assignee_email
  );

  // Pie Chart Data with percentages
  const pieData = {
    series: [open, inProgress, resolved],
    labels: [
      `Open (${openPercent}%)`,
      `In Progress (${inProgressPercent}%)`,
      `Resolved (${resolvedPercent}%)`,
    ],
    colors: ["#EF4444", "#F59E0B", "#10B981"],
  };

  // Weekly Data - Last 7 days
  const weeklyData = () => {
    const now = new Date();
    const days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    });

    const dayCounts = Array(7).fill(0);
    const dayLabels = days.map((day) => format(day, "EEE"));

    filteredIssues.forEach((issue) => {
      const issueDate = new Date(issue.created_at);
      const dayIndex = days.findIndex(
        (day) => format(day, "yyyy-MM-dd") === format(issueDate, "yyyy-MM-dd")
      );
      if (dayIndex !== -1) {
        dayCounts[dayIndex] += 1;
      }
    });

    return {
      series: [
        {
          name: "Issues Created",
          data: dayCounts,
        },
      ],
      categories: dayLabels,
      colors: ["#0EA5A4"],
    };
  };

  // **FIXED: Handle assignment properly**
  const assignMutation = useMutation({
    mutationFn: ({ issueId, assigneeId }) =>
      issuesApi.assign(issueId, { assignee_id: assigneeId }),
    onSuccess: () => {
      toast.success("Issue assigned successfully!");
      setAssignData(null);
      queryClient.invalidateQueries({ queryKey: ["issues-all"] });
    },
    onError: (error) => {
      console.error("Assignment error:", error);
      toast.error("Failed to assign issue");
    },
  });

  const handleAssignSubmit = (assigneeId) => {
    if (!assignData || !assignData.id) {
      toast.error("Issue data is missing");
      return;
    }
    assignMutation.mutate({ issueId: assignData.id, assigneeId });
  };

  // **FIXED: Navigation function for issue detail**
  const handleViewIssue = (issueId) => {
    navigate(`/app/issues/${issueId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
            Welcome back, {user?.first_name || "Manager"}!
          </h1>
          <p className="text-slate-600 mt-2">
            Team management and oversight dashboard
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
            <Users className="text-[#0EA5A4]" size={20} />
            <span className="font-medium text-slate-700">
              {staffData.length} Active Staff
            </span>
            {staffData.length === 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                No staff
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
            <BarChart3 className="text-[#0EA5A4]" size={20} />
            <span className="font-medium text-slate-700">
              {totalIssues} Total Issues
            </span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            Filter: Showing {timeFilter} issues
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Time Period:</span>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Open Issues"
          value={open}
          subtitle={`${openPercent}% of total`}
          icon={AlertCircle}
          color="red"
          trend="status"
        />
        <KpiCard
          title="In Progress"
          value={inProgress}
          subtitle={`${inProgressPercent}% of total`}
          icon={Clock}
          color="amber"
          trend="status"
        />
        <KpiCard
          title="Resolved"
          value={resolved}
          subtitle={`${resolvedPercent}% of total`}
          icon={CheckCircle}
          color="emerald"
          trend="status"
        />
        <KpiCard
          title="Unassigned"
          value={unassignedIssues.length}
          subtitle="Need attention"
          icon={UserCheck}
          color="blue"
          trend="assignment"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Issue Status Distribution"
          subtitle="Breakdown by current status"
          type="donut"
          data={pieData}
          height={350}
        />
        <ChartCard
          title="Issues Created This Week"
          subtitle="Daily issue creation trend"
          type="area"
          data={weeklyData()}
          height={350}
        />
      </div>

      {/* Unassigned Issues Section - FIXED NAVIGATION */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Unassigned Issues
            </h2>
            <p className="text-slate-600 mt-1">
              {unassignedIssues.length} issues waiting for assignment
            </p>
          </div>

          {staffData.length === 0 ? (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">
                No staff members available
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-teal-600 bg-teal-50 px-4 py-2 rounded-lg border border-teal-200">
              <Users size={18} />
              <span className="text-sm font-medium">
                {staffData.length} staff available
              </span>
            </div>
          )}
        </div>

        {unassignedIssues.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-500" size={40} />
            </div>
            <p className="text-slate-700 text-lg font-medium">
              All issues are assigned!
            </p>
            <p className="text-slate-500 mt-1">
              No unassigned issues at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {unassignedIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ scale: 1.01 }}
                className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {issue.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          issue.priority === "high" ||
                          issue.priority === "critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {issue.priority?.toUpperCase() || "MEDIUM"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Created by{" "}
                      <span className="font-medium">
                        {issue.reporter_email ||
                          issue.created_by?.email ||
                          "Unknown"}
                      </span>{" "}
                      •
                      <span className="ml-2">
                        {formatDistanceToNow(new Date(issue.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {/* **FIXED: Use button with onClick instead of Link** */}
                    <button
                      onClick={() => handleViewIssue(issue.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Details
                    </button>

                    <button
                      onClick={() => setAssignData(issue)}
                      disabled={staffData.length === 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        staffData.length === 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#0EA5A4] text-white hover:bg-teal-700"
                      }`}
                    >
                      {staffData.length === 0 ? (
                        <>
                          <AlertCircle size={16} />
                          No Staff
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          Assign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Assigned Issues - FIXED NAVIGATION */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Recently Assigned Issues
            </h2>
            <p className="text-slate-600 mt-1">
              {assignedIssues.length} issues currently assigned to staff
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp size={16} />
            <span>Team workload overview</span>
          </div>
        </div>

        {assignedIssues.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-gray-400" size={40} />
            </div>
            <p className="text-slate-700 text-lg font-medium">
              No assigned issues
            </p>
            <p className="text-slate-500 mt-1">
              Assign issues to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedIssues.slice(0, 6).map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ y: -4 }}
                className="p-5 bg-gradient-to-r from-teal-50 to-white rounded-xl border border-teal-100 hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => handleViewIssue(issue.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 line-clamp-1 group-hover:text-teal-600 transition-colors">
                      {issue.title}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Assigned to{" "}
                      <span className="font-medium text-teal-700">
                        {issue.assignee_email ||
                          issue.assignee?.email ||
                          "Unassigned"}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in-progress" ||
                          issue.status === "in_progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {issue.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Created{" "}
                    {formatDistanceToNow(new Date(issue.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  <div className="flex items-center gap-1 text-teal-600 group-hover:text-teal-700">
                    <ExternalLink size={12} />
                    Open
                  </div>
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
          staffUsers={staffData}
          onClose={() => setAssignData(null)}
          onAssign={handleAssignSubmit}
          isLoading={assignMutation.isPending}
          currentAssignee={assignData.assignee}
        />
      )}
    </motion.div>
  );
}
