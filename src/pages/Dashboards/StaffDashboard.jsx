import { useQuery } from "@tanstack/react-query";
import { Bug, Clock, CheckCircle, AlertCircle } from "lucide-react";
import KpiCard from "../../components/Dashboard/KpiCard";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";

export default function StaffDashboard() {
  const { data: issues } = useQuery({
    queryKey: ["issues", "assigned"],
    queryFn: () => issuesApi.list({ assignee: "me" }),
  });

  const assigned = issues?.data?.length || 0;
  const inProgress =
    issues?.data?.filter((i) => i.status === "in_progress").length || 0;
  const resolvedToday =
    issues?.data?.filter(
      (item) =>
        item.status === "resolved" &&
        new Date(item.updated_at).toDateString() === new Date().toDateString()
    ).length || 0;

  const overdue =
    issues?.data?.filter((i) => i.due_date && new Date(i.due_date) < new Date())
      .length || 0;

  const card = "bg-white border border-gray-200 rounded-xl p-6 shadow-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Staff Dashboard
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Assigned" value={assigned} icon={Bug} />
        <KpiCard title="In Progress" value={inProgress} icon={Clock} />
        <KpiCard
          title="Resolved Today"
          value={resolvedToday}
          icon={CheckCircle}
        />
        <KpiCard title="Overdue" value={overdue} icon={AlertCircle} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload */}
        <div className={card}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Workload Distribution
          </h3>

          <Chart
            options={{
              chart: { type: "bar", toolbar: { show: false } },
              plotOptions: { bar: { horizontal: true } },
              dataLabels: { enabled: false },
              xaxis: {
                categories: ["Open", "In Progress", "Review", "Resolved"],
              },
              colors: ["#0EA5A4"],
            }}
            series={[
              { name: "Count", data: [2, inProgress, 1, resolvedToday] },
            ]}
            type="bar"
            height={250}
          />
        </div>

        {/* SLA */}
        <div className={card}>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            SLA Progress
          </h3>

          <Chart
            options={{
              chart: { type: "donut" },
              labels: ["On Time", "At Risk", "Overdue"],
              colors: ["#10B981", "#FBBF24", "#EF4444"],
            }}
            series={[75, 20, overdue]}
            type="donut"
            height={250}
          />
        </div>
      </div>
    </motion.div>
  );
}
