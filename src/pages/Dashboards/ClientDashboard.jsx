// src/pages/Dashboards/ClientDashboard.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import {
  formatDistanceToNow,
  isToday,
  isWithinInterval,
  subDays,
} from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { issuesApi } from "../../api/issuesApi.js";
import { useAuth } from "../../app/hooks.js";
import ChartCard from "../../components/Dashboard/ChartCard.jsx";
import KpiCard from "../../components/Dashboard/KpiCard.jsx";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName =
    user?.first_name || user?.email?.split("@")[0] || "Client";
  const [timeFilter, setTimeFilter] = useState("today"); // today | week | month

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["client-issues"],
    queryFn: () => issuesApi.list(),
  });

  const allIssues = issuesData?.data || [];
  const issues = allIssues.filter(
    (i) => i.created_by === "client@cfitp.com" || i.created_by === user?.email
  );

  // === STATS ===
  const open = issues.filter((i) => i.status === "open").length;
  const inProgress = issues.filter((i) => i.status === "in-progress").length;
  const resolved = issues.filter(
    (i) => i.status === "resolved" || i.status === "closed"
  ).length;

  // === PIE CHART ===
  const pieData = {
    series: [open, inProgress, resolved],
    labels: ["Open", "In Progress", "Resolved"],
  };

  // === WEEKLY CHART ===
  const weeklyData = () => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1);
    const counts = Array(7).fill(0);
    issues.forEach((issue) => {
      const date = new Date(issue.created_at);
      const dayIndex = Math.floor((date - start) / 86400000);
      if (dayIndex >= 0 && dayIndex < 7) counts[dayIndex]++;
    });
    return {
      series: [{ data: counts }],
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    };
  };

  // === RECENT ACTIVITY WITH TIME FILTER ===
  const getFilteredRecentIssues = () => {
    const now = new Date();
    return issues
      .filter((issue) => {
        const date = new Date(issue.created_at);
        if (timeFilter === "today") return isToday(date);
        if (timeFilter === "week")
          return isWithinInterval(date, { start: subDays(now, 7), end: now });
        if (timeFilter === "month")
          return isWithinInterval(date, { start: subDays(now, 30), end: now });
        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
  };

  const recentIssues = getFilteredRecentIssues();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0EA5A4] to-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-teal-100">
            {displayName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Welcome back,{" "}
              <span className="text-[#0EA5A4]">{displayName}!</span>
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Here’s what’s happening with your issues
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/feedback/new")}
            className="bg-white border-2 border-gray-200 hover:border-gray-300 text-slate-700 px-7 py-4 rounded-2xl flex items-center gap-3 shadow-lg transition font-medium text-lg"
          >
            <MessageSquare size={24} /> Submit Feedback
          </button>
          <button
            onClick={() => navigate("/issues/new")}
            className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-9 py-4 rounded-2xl flex items-center gap-3 shadow-2xl transition transform hover:scale-105 font-bold text-lg"
          >
            <Plus size={28} /> New Issue
          </button>
        </div>
      </div>

      {/* KPIs */}
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
          value="2.3h"
          icon={Clock}
          color="teal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Issue Status Overview" type="pie" data={pieData} />
        <ChartCard title="Issues This Week" type="line" data={weeklyData()} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Recent Activity</h2>
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] cursor-pointer hover:bg-gray-100 transition"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-4 pointer-events-none text-gray-500"
              size={20}
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-center py-16 text-slate-500">
            Loading activity...
          </p>
        ) : recentIssues.length === 0 ? (
          <div className="text-center py-20">
            <Lottie
              animationData={emptyAnimation}
              className="w-80 mx-auto"
              loop={true}
            />
            <p className="text-2xl text-slate-600 mt-8">
              No activity in this period
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {recentIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ x: 10 }}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-gray-100 hover:to-gray-200 transition-all cursor-pointer border border-gray-200 shadow-md"
              >
                <div>
                  <p className="text-xl font-semibold text-slate-800">
                    {issue.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(issue.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex gap-4">
                  <span
                    className={`px-5 py-2 rounded-full text-sm font-bold ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in-progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {issue.status.replace("-", " ").toUpperCase()}
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      issue.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : issue.priority === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {issue.priority.toUpperCase()}
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
