import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "../../api/issuesApi";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  isToday,
  subDays,
  isWithinInterval,
} from "date-fns";
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import Chart from "react-apexcharts";
import { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("month");

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["issues-all"],
    queryFn: () => issuesApi.listAll(),
  });

  const allIssues = issuesData?.results || [];
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");

  // Filter issues for this client only
  const issues = allIssues.filter((i) => {
    return (
      i.reporter_email === user.email ||
      i.created_by_email === user.email ||
      (i.reporter && i.reporter.id === user.id) ||
      (i.created_by && i.created_by.id === user.id)
    );
  });

  // Status counts - ONLY 4 STATUSES NOW
  const open = issues.filter((i) => i.status === "open").length;
  const inProgress = issues.filter((i) => i.status === "in_progress").length;
  const resolved = issues.filter((i) => i.status === "resolved").length;
  const closed = issues.filter((i) => i.status === "closed").length;

  // NEW: Calculate feedback count (if you have feedback API)
  const feedbackCount = 0; // Replace with actual feedback count if available

  // Pie chart with 4 statuses
  const pieOptions = {
    series: [open, inProgress, resolved, closed], // REMOVED: reopen
    colors: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"], // REMOVED: purple color
    chart: { type: "donut", height: 300 },
    labels: ["Open", "In Progress", "Resolved", "Closed"], // REMOVED: "Reopen"
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontFamily: "inherit",
      fontWeight: 500,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Issues",
              fontSize: "22px",
              fontWeight: 600,
              color: "#374151",
              formatter: function (w) {
                return issues.length.toString();
              },
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
              formatter: function (val) {
                return Math.round(val).toString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return value + " issue" + (value !== 1 ? "s" : "");
        },
      },
    },
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: new Date(),
  });

  const dailyCounts = weekDays.map(
    (day) =>
      issues.filter(
        (i) =>
          format(new Date(i.created_at), "yyyy-MM-dd") ===
          format(day, "yyyy-MM-dd")
      ).length
  );

  // RESTORED: Original line graph
  const lineOptions = {
    series: [
      {
        name: "Issues",
        data: dailyCounts.some((count) => count > 0)
          ? dailyCounts
          : [0, 0, 0, 0, 0, 0, 0],
      },
    ],
    colors: ["#0EA5A4"],
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
    },
    xaxis: {
      categories: weekDays.map((d) => format(d, "EEE")),
      labels: {
        style: {
          colors: "#6b7280",
        },
      },
    },
    yaxis: {
      min: 0,
      max: Math.max(...dailyCounts, 5) + 1,
      tickAmount: 4,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} issue${value !== 1 ? "s" : ""}`,
      },
    },
  };

  const getFilteredIssues = () => {
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

  const recentIssues = getFilteredIssues();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Welcome back, {user?.first_name || "Client"}!
          </h1>
          <p className="text-xl text-slate-600 mt-2">
            Here's what's happening with your issues
          </p>
        </div>
      </div>

      {/* 5 CARDS NOW (was 6) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <p className="text-4xl font-bold text-red-600">{open}</p>
          <p className="text-slate-600">Open Issues</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
          <Clock size={40} className="mx-auto text-amber-500 mb-3" />
          <p className="text-4xl font-bold text-amber-600">{inProgress}</p>
          <p className="text-slate-600">In Progress</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
          <CheckCircle size={40} className="mx-auto text-blue-500 mb-3" />
          <p className="text-4xl font-bold text-blue-600">{resolved}</p>
          <p className="text-slate-600">Resolved</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
          <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
          <p className="text-4xl font-bold text-emerald-600">{closed}</p>
          <p className="text-slate-600">Closed</p>
        </div>

        {/* CHANGED: Replaced Reopen with Feedback/Total */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
          <AlertCircle size={40} className="mx-auto text-teal-500 mb-3" />
          <p className="text-4xl font-bold text-teal-600">{issues.length}</p>
          <p className="text-slate-600">Total Issues</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 border">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Issue Status Overview
          </h3>
          <Chart
            options={pieOptions}
            series={pieOptions.series}
            type="donut"
            height={320}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Issues This Week
          </h3>
          <Chart
            options={lineOptions}
            series={lineOptions.series}
            type="area"
            height={320}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
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

        {recentIssues.length === 0 ? (
          <div className="text-center py-16">
            <Lottie animationData={emptyAnimation} className="w-64 mx-auto" />
            <p className="text-slate-500 text-xl mt-4">
              No activity in this period
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(`/app/issues/${issue.id}`)}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-gray-100 hover:to-gray-200 transition-all cursor-pointer border border-gray-200 shadow-md hover:shadow-lg"
              >
                <div className="flex-1">
                  <p className="text-xl font-semibold text-slate-800">
                    {issue.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {format(
                      new Date(issue.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                <div className="flex gap-4">
                  <span
                    className={`px-5 py-2 rounded-full text-sm font-bold ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in_progress"
                        ? "bg-amber-100 text-amber-700"
                        : issue.status === "resolved"
                        ? "bg-blue-100 text-blue-700"
                        : issue.status === "closed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {issue.status?.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {recentIssues.length > 4 && (
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
              <ChevronDown size={16} />
              Scroll to see more activities
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
