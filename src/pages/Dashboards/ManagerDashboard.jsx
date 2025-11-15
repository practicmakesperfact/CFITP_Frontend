import { useQuery } from "@tanstack/react-query";
import { Bug, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import KpiCard from "../../components/Dashboard/KpiCard";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";

export default function ManagerDashboard() {
  const { data: issues } = useQuery({
    queryKey: ["issues", "team"],
    queryFn: () => issuesApi.list(),
  });

  const card = "bg-white border border-gray-200 rounded-xl p-6 shadow-sm";

  const total = issues?.data?.length || 0;
  const critical =
    issues?.data?.filter((i) => i.priority === "critical").length || 0;
  const efficiency = total
    ? Math.round(
        (issues?.data?.filter((i) => i.status === "closed").length / total) *
          100
      )
    : 0;

  const overdue =
    issues?.data?.filter((i) => i.due_date && new Date(i.due_date) < new Date())
      .length || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Manager Overview
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Team Issues" value={total} icon={Bug} />
        <KpiCard title="Critical" value={critical} icon={AlertTriangle} />
        <KpiCard
          title="Efficiency"
          value={`${efficiency}%`}
          icon={TrendingUp}
        />
        <KpiCard title="Overdue" value={overdue} icon={Clock} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Team Workload
          </h3>

          <Chart
            options={{
              chart: { type: "bar", toolbar: { show: false } },
              xaxis: { categories: ["John", "Sarah", "Mike", "Anna"] },
              colors: ["#0EA5A4", "#FB923C"],
              dataLabels: { enabled: false },
            }}
            series={[
              { name: "Open", data: [5, 3, 7, 2] },
              { name: "Closed", data: [8, 6, 4, 9] },
            ]}
            type="bar"
            height={300}
          />
        </div>

        <div className={card}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Priority Distribution
          </h3>

          <Chart
            options={{
              chart: { type: "pie" },
              labels: ["Low", "Medium", "High", "Critical"],
              colors: ["#10B981", "#FBBF24", "#FB923C", "#EF4444"],
            }}
            series={[10, 15, 8, critical]}
            type="pie"
            height={300}
          />
        </div>
      </div>
    </motion.div>
  );
}
