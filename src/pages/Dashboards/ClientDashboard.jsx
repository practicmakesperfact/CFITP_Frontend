
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


  const open = issues.filter((i) => i.status === "open").length;
  const inProgress = issues.filter((i) => i.status === "in-progress").length;
  const closed = issues.filter((i) => i.status === "closed").length;

  const pieOptions = {
    series: [open, inProgress, closed],
    colors: ["#ef4444", "#f59e0b", "#10b981"],
    chart: { type: "donut", height: 300 },
    labels: ["Open", "In Progress", "Closed"],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "22px",
              fontWeight: 600,
              color: "#374151",
            },
          },
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

  const chartData = dailyCounts.some(count => count>0)
    ? dailyCounts
    : [0, 0, 0, 0, 0, 0, 0];

  // const lineOptions = {
  //   series: [{
  //           name: "Issues", 
  //           data: dailyCounts 
  //           }],
  //   colors: ["#0EA5A4"],
  //   chart: { 
  //           type: "area", 
  //           height: 300, 
  //           toolbar: { show: false } 
  //         },
  //   xaxis: {
  //     categories: weekDays.map((d) => format(d, "EEE")),
  //     labels: { 
  //              style: { colors: "#6b7280" } },
  //           },
  //   yaxis: { 
  //             min: 0, 
  //             max: Math.max(...dailyCounts, 5) + 1, tickAmount: 4
  //           },
  //   fill: { opacity: 0.1 },
  //   stroke: { curve: "smooth", width: 3 },
  //   dataLabels: { enabled: false },
  //   grid: { show: false },
  // };
  const lineOptions = {
    series: [
      {
        name: "Issues",
        data: chartData,
      },
    ],
    colors: ["#0EA5A4"],
    chart: {
      type: "bar", // ✅ Changed from "area" to "bar" for visibility
      height: 300,
      toolbar: { show: false },
    },
    xaxis: {
      categories: weekDays.map((d) => format(d, "EEE")),
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      axisBorder: { show: true },
      axisTicks: { show: true },
    },
    yaxis: {
      min: 0,
      max: Math.max(...chartData, 5) + 1,
      tickAmount: 4,
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "60%", // Makes bars wider
        dataLabels: {
          position: "top", // Shows numbers on top of bars
        },
      },
    },
    dataLabels: {
      enabled: true, // ✅ Shows numbers on bars
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#374151"],
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
      position: "back",
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
        <button
          onClick={() => navigate("/app/issues/new")}
          className="bg-[#0EA5A4] hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg transition-all hover:scale-105"
        >
          <Plus size={28} /> New Issue
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
          <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
          <p className="text-4xl font-bold text-emerald-600">{closed}</p>
          <p className="text-slate-600">Closed</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
          <Clock size={40} className="mx-auto text-blue-500 mb-3" />
          <p className="text-4xl font-bold text-blue-600">{issues.length}</p>
          <p className="text-slate-600">Total Issues</p>
        </div>
      </div>

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
                onClick={() => navigate(`/issues/${issue.id}`)}
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
                        : issue.status === "in-progress" || issue.status === "in_progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {issue.status?.replace(/_/g, " ").replace("-", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scroll indicator */}
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
