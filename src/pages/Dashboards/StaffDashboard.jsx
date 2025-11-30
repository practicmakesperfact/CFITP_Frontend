import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  User,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { formatDistanceToNow, subDays, isWithinInterval } from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { issuesApi } from "../../api/issuesApi";
import { useAuth } from "../../app/hooks";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChartCard from "../../components/Dashboard/ChartCard";
import { useState } from "react"; 

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState("month");

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["issues-all"],
    queryFn: () => issuesApi.listAll(),
  });

  const allIssues = issuesData?.results || [];
  const myIssues = allIssues.filter((i) => i.assignee_email === user?.email);

  const getFilteredIssues = () => {
    const now = new Date();
    return myIssues.filter((issue) => {
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
    (i) => i.status === "in-progress"
  ).length;
  const resolved = filteredIssues.filter((i) =>
    ["resolved", "closed"].includes(i.status)
  ).length;

  const weeklyData = () => {
    const days = Array(7).fill(0);
    filteredIssues.forEach((issue) => {
      const created = new Date(issue.created_at);
      const day = created.getDay();
      days[day] += 1;
    });
    return {
      series: [{ name: "Your Issues", data: days }],
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  };

  const recentActivity = filteredIssues
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Staff Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Your assigned tasks and progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
            <ClipboardList className="text-[#0EA5A4]" size={20} />
            <span className="font-medium text-slate-700">
              {filteredIssues.length} Tasks
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
            <User className="text-[#0EA5A4]" size={24} />
            <span className="font-medium text-slate-700">
              {user?.first_name || user?.email}
            </span>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Open Tasks"
          value={open}
          icon={AlertTriangle}
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
          title="Total Assigned"
          value={filteredIssues.length}
          icon={ClipboardList}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Your Issue Progress (This Week)"
          type="line"
          data={weeklyData()}
        />
        <ChartCard
          title="Status Summary"
          type="pie"
          data={{
            series: [open, inProgress, resolved],
            labels: ["Open", "In Progress", "Resolved"],
          }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            My Tasks ({filteredIssues.length})
          </h2>
          {filteredIssues.length > 4 && (
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <ChevronDown size={16} />
              Scroll to see more
            </p>
          )}
        </div>

        {isLoading ? (
          <p className="text-center text-slate-500 py-12">
            Loading your tasks...
          </p>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-16">
            <Lottie animationData={emptyAnimation} className="w-64 mx-auto" />
            <p className="text-slate-600 mt-4 text-lg">
              No tasks assigned in this period.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {filteredIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ x: 8 }}
                className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    From {issue.reporter_email} •{" "}
                    {formatDistanceToNow(new Date(issue.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    issue.status === "open"
                      ? "bg-red-100 text-red-700"
                      : issue.status === "in-progress"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {issue.status.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Recent Activity ({recentActivity.length})
          </h2>
          {recentActivity.length > 4 && (
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <ChevronDown size={16} />
              Scroll to see more
            </p>
          )}
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            No recent updates...
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {recentActivity.map((i) => (
              <motion.div
                key={i.id}
                whileHover={{ x: 8 }}
                onClick={() => navigate(`/issues/${i.id}`)}
                className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-800">
                      {i.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      Updated{" "}
                      {formatDistanceToNow(new Date(i.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      i.status === "open"
                        ? "bg-red-100 text-red-700"
                        : i.status === "in-progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {i.status.toUpperCase()}
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
