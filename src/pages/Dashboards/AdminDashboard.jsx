// src/pages/Dashboards/AdminDashboard.jsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ClipboardList,
  UserCog,
  MessageSquare,
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem("cfitp_feedback") || "[]");
      setFeedback(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const { data: issuesResponse, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: issuesApi.list,
  });

  const issues = issuesResponse?.data || [];

  const openCount = issues.filter((i) => i.status === "open").length;
  const inProgressCount = issues.filter(
    (i) => i.status === "in-progress"
  ).length;
  const resolvedCount = issues.filter((i) =>
    ["resolved", "closed"].includes(i.status)
  ).length;

  const statusChartData = {
    series: [openCount, inProgressCount, resolvedCount],
    labels: ["Open", "In Progress", "Resolved"],
  };

  const dailyCounts = Array(7).fill(0);
  issues.forEach((issue) => {
    const day = new Date(issue.created_at).getDay();
    dailyCounts[day] += 1;
  });

  const dailyChartData = {
    series: [{ name: "New Issues", data: dailyCounts }],
    categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-800">Admin Dashboard</h1>
        <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
          <UserCog className="text-[#0EA5A4]" size={24} />
          <span className="font-medium text-slate-700">
            {user?.first_name || user?.email}
          </span>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Issue Status Distribution"
          type="pie"
          data={statusChartData}
        />
        <ChartCard
          title="Issues Created This Week"
          type="line"
          data={dailyChartData}
        />
      </div>

      {/* CLIENT FEEDBACK — VISIBLE ONLY TO ADMIN */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-4">
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
          <div className="space-y-6">
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
                  <p className="font-bold text-lg">Client</p>
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

      {/* All Issues */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">All Issues</h2>
        {issues.length === 0 ? (
          <div className="text-center py-20">
            <Lottie animationData={emptyAnimation} className="w-72 mx-auto" />
            <p className="text-slate-600 mt-4 text-lg">No issues found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard issue={issue} key={issue.id} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
