import { useQuery } from "@tanstack/react-query";
import { Users, Bug, AlertTriangle, TrendingUp } from "lucide-react";
import KpiCard from "../../components/Dashboard/KpiCard";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: issues } = useQuery({
    queryKey: ["issues", "all"],
    queryFn: () => issuesApi.list(),
  });

  const { data: users } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => authApi.me().then(() => ({ total: 48, active: 42 })), // mock
  });

  const totalIssues = issues?.data?.length || 0;
  const criticalIssues =
    issues?.data?.filter((i) => i.priority === "critical").length || 0;

  const trendOptions = {
    chart: { toolbar: { show: false }, type: "area" },
    stroke: { curve: "smooth" },
    fill: { opacity: 0.3 },
    colors: ["#0EA5A4"],
    dataLabels: { enabled: false },
  };

  const trendSeries = [{ name: "Issues", data: [30, 40, 35, 50, 49, 60, 70] }];

  const cardClass = "bg-white border border-gray-200 rounded-xl p-6 shadow-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">System Admin</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Users" value={users?.total || 0} icon={Users} />
        <KpiCard title="Active Users" value={users?.active || 0} icon={Users} />
        <KpiCard title="Total Issues" value={totalIssues} icon={Bug} />
        <KpiCard
          title="Critical Issues"
          value={criticalIssues}
          icon={AlertTriangle}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} lg:col-span-2`}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Issue Trend (7 days)
          </h3>
          <Chart
            options={trendOptions}
            series={trendSeries}
            type="area"
            height={300}
          />
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            User Growth
          </h3>
          <Chart
            options={{
              chart: { type: "line", toolbar: { show: false } },
              stroke: { curve: "smooth" },
              colors: ["#FB923C"],
              dataLabels: { enabled: false },
            }}
            series={[{ data: [10, 20, 28, 35, 40, 45, 48] }]}
            type="line"
            height={300}
          />
        </div>
      </div>

      {/* AUDIT LOG */}
      <div className={`${cardClass} mt-8`}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Recent Audit Log
        </h3>

        <div className="text-sm text-slate-600 space-y-2">
          <p>
            <b>Admin</b> created user <code>jane@company.com</code> — 2h ago
          </p>
          <p>
            <b>Backup</b> completed successfully — 6h ago
          </p>
          <p>
            <b>System</b> generated monthly report — 1d ago
          </p>
        </div>
      </div>
    </motion.div>
  );
}

