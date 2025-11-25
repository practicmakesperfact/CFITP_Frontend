// src/pages/Dashboards/ManagerDashboard.jsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserCog,
  ClipboardCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

import { subDays, isWithinInterval, formatDistanceToNow } from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";

import { issuesApi } from "../../api/issuesApi";
import { useAuth } from "../../app/hooks";

import KpiCard from "../../components/Dashboard/KpiCard";
import ChartCard from "../../components/Dashboard/ChartCard";
import AssignModal from "../../components/Issues/AssignModal";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignData, setAssignData] = useState(null);

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

  const markAsRead = (id) => {
    const updated = feedback.map((f) =>
      f.id === id ? { ...f, read: true } : f
    );
    localStorage.setItem("cfitp_feedback", JSON.stringify(updated));
    setFeedback(updated);
  };

  const { data: issuesResponse, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: issuesApi.list,
  });

  const issues = issuesResponse?.data || [];

  const open = issues.filter((i) => i.status === "open").length;
  const inProgress = issues.filter((i) => i.status === "in-progress").length;
  const resolved = issues.filter((i) =>
    ["resolved", "closed"].includes(i.status)
  ).length;

  const pieData = {
    series: [open, inProgress, resolved],
    labels: ["Open", "In Progress", "Resolved"],
  };

  const weeklyData = () => {
    const dayCounts = Array(7).fill(0);
    issues.forEach((issue) => {
      const day = new Date(issue.created_at).getDay();
      dayCounts[day] += 1;
    });
    return {
      series: [{ data: dayCounts }],
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  };

  const recent = issues
    .filter((i) =>
      isWithinInterval(new Date(i.created_at), {
        start: subDays(new Date(), 7),
        end: new Date(),
      })
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  const handleAssigned = () => {
    toast.success("Staff assigned successfully");
    setAssignData(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-800">Manager Dashboard</h1>
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
          title="Total Issues"
          value={issues.length}
          icon={ClipboardCheck}
          color="teal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Issue Status Overview" type="pie" data={pieData} />
        <ChartCard title="Issues This Week" type="line" data={weeklyData()} />
      </div>

      {/* CLIENT FEEDBACK — VISIBLE ONLY TO MANAGER */}
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
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-lg text-slate-800">Client</p>
                  <span className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(item.date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {item.text}
                </p>
                {!item.read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="mt-4 text-sm text-[#0EA5A4] hover:underline font-medium"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unassigned Issues */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">
          Unassigned Issues
        </h2>
        {issues.filter((i) => !i.assignee_email).length === 0 ? (
          <div className="text-center py-16">
            <Lottie animationData={emptyAnimation} className="w-64 mx-auto" />
            <p className="text-slate-600 mt-4 text-lg">No unassigned issues</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues
              .filter((i) => !i.assignee_email)
              .map((issue) => (
                <motion.div
                  key={issue.id}
                  whileHover={{ x: 8 }}
                  className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Created{" "}
                      {formatDistanceToNow(new Date(issue.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAssignData(issue)}
                      className="px-5 py-2 rounded-xl bg-[#0EA5A4] text-white hover:bg-teal-700 font-medium shadow"
                    >
                      Assign Staff
                    </button>
                    <button
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-100"
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">
          Recent Activity
        </h2>
        {recent.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            No recent activity...
          </p>
        ) : (
          <div className="space-y-4">
            {recent.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ x: 10 }}
                className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 cursor-pointer"
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">
                      {issue.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(issue.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in-progress"
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

      {assignData && (
        <AssignModal
          issue={assignData}
          onClose={() => setAssignData(null)}
          onAssign={handleAssigned}
        />
      )}
    </motion.div>
  );
}
