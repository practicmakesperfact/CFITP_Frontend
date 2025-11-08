import { useQuery } from "@tanstack/react-query";
// import { issuesApi, authApi } from "../../api";
import KpiCard from "../../components/Dashboard/KpiCard.jsx";
import { Users, Bug, FileText, TrendingUp } from "lucide-react";
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
  const reportsGenerated = 24;

  const trendOptions = {
    chart: { type: "area", sparkline: { enabled: true } },
    stroke: { curve: "smooth" },
    fill: { opacity: 0.3 },
    colors: ["#0EA5A4"],
  };
  const trendSeries = [{ name: "Issues", data: [30, 40, 35, 50, 49, 60, 70] }];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-8">System Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Users" value={users?.total || 0} icon={Users} />
        <KpiCard
          title="Active Users"
          value={users?.active || 0}
          icon={Users}
          color="green"
        />
        <KpiCard title="Total Issues" value={totalIssues} icon={Bug} />
        <KpiCard
          title="Critical Issues"
          value={criticalIssues}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Issue Trend (7 days)</h3>
          <Chart
            options={trendOptions}
            series={trendSeries}
            type="area"
            height={300}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <Chart
            options={{
              chart: { type: "line", sparkline: { enabled: true } },
              stroke: { curve: "smooth" },
              colors: ["#FB923C"],
            }}
            series={[{ data: [10, 20, 28, 35, 40, 45, 48] }]}
            type="line"
            height={300}
          />
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Audit Log</h3>
        <div className="text-sm space-y-2">
          <p>
            <strong>Admin</strong> created user <code>jane@company.com</code> —
            2h ago
          </p>
          <p>
            <strong>Backup</strong> completed successfully — 6h ago
          </p>
          <p>
            <strong>System</strong> generated monthly report — 1d ago
          </p>
        </div>
      </div>
    </motion.div>
  );
}
