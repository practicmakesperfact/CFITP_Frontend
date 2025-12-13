
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ClipboardList,
  UserCog,
  MessageSquare,
  Trash2,
  Users,
  ChevronDown,
} from "lucide-react";
import { issuesApi } from "../../api/issuesApi";
import { useAuth } from "../../app/hooks";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChartCard from "../../components/Dashboard/ChartCard";
import IssueCard from "../../components/Issues/IssueCard";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState([]);
  const [timeFilter, setTimeFilter] = useState("today");

  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem("cfitp_feedback") || "[]");
      setFeedback(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["issues-all"],
    queryFn: () => issuesApi.listAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => issuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues-all"] });
      toast.success("Issue deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete issue");
    },
  });

  const handleDeleteIssue = (issueId, issueTitle) => {
    if (window.confirm(`Are you sure you want to delete "${issueTitle}"?`)) {
      deleteMutation.mutate(issueId);
    }
  };

  const issues = issuesData?.results || [];

  const openCount = issues.filter((i) => i.status === "open").length;
  const inProgressCount = issues.filter(
    (i) => i.status === "in-progress" || i.status === "in_progress"
  ).length;
  const resolvedCount = issues.filter((i) =>
    ["resolved", "closed"].includes(i.status)
  ).length;

  const statusChartData = {
    series: [openCount, inProgressCount, resolvedCount],
    labels: ["Open", "In Progress", "Resolved"],
  };

  // Weekly data for charts
  const getWeeklyData = () => {
    const dayCounts = Array(7).fill(0);
    issues.forEach((issue) => {
      const day = new Date(issue.created_at).getDay();
      dayCounts[day] += 1;
    });
    return {
      series: [{ name: "New Issues", data: dayCounts }],
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  };

  // Filter recent issues based on time filter
  const getRecentIssues = () => {
    const now = new Date();
    const filtered = issues.filter((issue) => {
      const date = new Date(issue.created_at);
      const timeDiff = now - date;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      if (timeFilter === "today") return daysDiff <= 1;
      if (timeFilter === "week") return daysDiff <= 7;
      if (timeFilter === "month") return daysDiff <= 30;
      return true;
    });

    return filtered
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
  };

  const recentIssues = getRecentIssues();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">System overview and management</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
          <UserCog className="text-[#0EA5A4]" size={24} />
          <span className="font-medium text-slate-700">
            {user?.first_name || user?.email}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Open Issues"
          value={openCount}
          icon={AlertTriangle}
          color="red"
        />
        <KpiCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="amber"
        />
        <KpiCard
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle}
          color="emerald"
        />
        <KpiCard
          title="Total Issues"
          value={issues.length}
          icon={ClipboardList}
          color="teal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Issue Status Distribution"
          type="pie"
          data={statusChartData}
        />
        <ChartCard
          title="Issues Created This Week"
          type="line"
          data={getWeeklyData()}
        />
      </div>

      {/* Client Feedback Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-4">
          <MessageSquare className="text-[#0EA5A4]" size={32} />
          Client Feedback ({feedback.length})
        </h2>
        {feedback.length === 0 ? (
          <div className="text-center py-16">
            <Lottie animationData={emptyAnimation} className="w-64 mx-auto" />
            <p className="text-xl text-slate-600 mt-6">
              No feedback from clients yet
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`p-6 rounded-2xl border-2 ${
                  item.read
                    ? "border-gray-200 bg-gray-50"
                    : "border-[#0EA5A4] bg-teal-50 shadow-md"
                }`}
              >
                <div className="flex justify-between mb-3">
                  <p className="font-bold text-lg">Client Feedback</p>
                  <span className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(item.date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Issues Section with Delete */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            All Issues ({issues.length})
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] cursor-pointer hover:bg-gray-100 transition"
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

        {issues.length === 0 ? (
          <div className="text-center py-20">
            <Lottie animationData={emptyAnimation} className="w-72 mx-auto" />
            <p className="text-slate-600 mt-4 text-lg">No issues found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pb-4">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="relative group">
                <IssueCard issue={issue} />
                <button
                  onClick={() => handleDeleteIssue(issue.id, issue.title)}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Delete Issue"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Scroll indicator */}
        {recentIssues.length > 6 && (
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
              <ChevronDown size={16} />
              Scroll to see more issues
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
