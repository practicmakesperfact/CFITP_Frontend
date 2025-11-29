import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  User,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow, subDays, isWithinInterval } from "date-fns";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { issuesApi } from "../../api/issuesApi";
import { useAuth } from "../../app/hooks";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChartCard from "../../components/Dashboard/ChartCard";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: issuesApi.list.then(res => res.data),
  });

  
  const allIssues = Array.isArray(issuesData?.data) ? issuesData.data : [];

  
  const myIssues = allIssues.filter((i) => i.assignee_email === user?.email);

  const open = myIssues.filter((i) => i.status === "open").length;
  const inProgress = myIssues.filter((i) => i.status === "in-progress").length;
  const resolved = myIssues.filter((i) =>
    ["resolved", "closed"].includes(i.status)
  ).length;

  const weeklyData = () => {
    const days = Array(7).fill(0);
    myIssues.forEach((issue) => {
      const created = new Date(issue.created_at);
      const day = created.getDay();
      days[day] += 1;
    });
    return {
      series: [{ data: days }],
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  };

  const recentActivity = myIssues
    .filter((i) =>
      isWithinInterval(new Date(i.created_at), {
        start: subDays(new Date(), 7),
        end: new Date(),
      })
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-800">Staff Dashboard</h1>
        <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
          <User className="text-[#0EA5A4]" size={24} />
          <span className="font-medium text-slate-700">
            {user?.first_name || user?.email}
          </span>
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
          value={myIssues.length}
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

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">My Tasks</h2>
        {isLoading ? (
          <p className="text-center text-slate-500 py-12">Loading...</p>
        ) : myIssues.length === 0 ? (
          <div className="text-center py-16">
            <Lottie animationData={emptyAnimation} className="w-64 mx-auto" />
            <p className="text-slate-600 mt-4 text-lg">
              No tasks assigned yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ x: 8 }}
                className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow flex items-center justify-between cursor-pointer"
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Assigned{" "}
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

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-center text-slate-500">No recent updates...</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((i) => (
              <motion.div
                key={i.id}
                whileHover={{ x: 8 }}
                onClick={() => navigate(`/issues/${i.id}`)}
                className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">
                      {i.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      Updated{" "}
                      {formatDistanceToNow(new Date(i.created_at), {
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
