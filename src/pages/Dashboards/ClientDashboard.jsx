
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow, startOfWeek, addDays, format } from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { issuesApi } from "../../api/issuesApi.js";
import { useAuth } from "../../app/hooks.js";
import ChartCard from "../../components/Dashboard/ChartCard.jsx";
import KpiCard from "../../components/Dashboard/KpiCard.jsx";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["client-issues"],
    queryFn: () => issuesApi.list({ client: true }),
  });

  const issues = issuesData?.data || [];

  // === LIVE STATS ===
  const open = issues.filter((i) => i.status === "open").length;
  const inProgress = issues.filter((i) => i.status === "in-progress").length;
  const resolved = issues.filter((i) => i.status === "resolved").length;

  // Mock avg response time until backend provides it
  const avgResponseTime = "2.3h";

  // Pie chart data
  const pieData = {
    series: [open, inProgress, resolved],
    labels: ["Open", "In Progress", "Resolved"],
  };

const weeklyData = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const counts = Array(7).fill(0);

  issues.forEach((issue) => {
    const date = new Date(issue.created_at);
    const dayIndex = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    if (dayIndex >= 0 && dayIndex < 7 && date >= start) {
      counts[dayIndex]++;
    }
  });

  return {
    series: [{ name: "Issues Created", data: counts }],
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  };
};

const lineData = weeklyData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.first_name?.[0] || "C"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, {user?.first_name || "Client"}!
            </h1>
            <p className="text-slate-600">
              Here's what's happening with your issues
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/feedback/new")}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <MessageSquare size={20} />
            Submit Feedback
          </button>
          <button
            onClick={() => navigate("/issues/new")}
            className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition transform hover:scale-105"
          >
            <Plus size={22} />
            New Issue
          </button>
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
          title="Avg. Response Time"
          value={avgResponseTime}
          icon={Clock}
          color="teal"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Issue Status Overview" type="pie" data={pieData} />
        <ChartCard title="Issues This Week" type="line" data={lineData} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Recent Activity
        </h2>

        {isLoading && <p className="text-center text-slate-500">Loading...</p>}

        {!isLoading && issues.length === 0 && (
          <div className="text-center py-12">
            <Lottie
              animationData={emptyAnimation}
              className="w-64 mx-auto"
              loop={true}
            />
            <p className="text-xl text-slate-600 mt-6">
              No issues yet. Create your first one!
            </p>
          </div>
        )}

        {!isLoading && issues.length > 0 && (
          <div className="space-y-4">
            {issues.slice(0, 6).map((issue) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-slate-800">{issue.title}</p>
                  <p className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(issue.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in-progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {issue.status.replace("-", " ")}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      issue.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : issue.priority === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {issue.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
