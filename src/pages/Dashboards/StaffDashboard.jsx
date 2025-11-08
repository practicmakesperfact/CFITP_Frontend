import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "../../api/issuesApi.js";
import KpiCard from "../../components/Dashboard/KpiCard.jsx";
import { Bug, Clock, CheckCircle, AlertCircle } from "lucide-react";
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
      (i) =>
        i.status === "resolved" &&
        new Date(i.updated_at).toDateString() === new Date().toDateString()
    ).length || 0;
  const overdue =
    issues?.data?.filter(
      (i) =>
        i.due_date && new Date(i.due_date) < new Date() && i.status !== "closed"
    ).length || 0;

  const workloadOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    xaxis: { categories: ["Open", "In Progress", "Review", "Resolved"] },
    colors: ["#0EA5A4"],
  };
  const workloadSeries = [
    { name: "Count", data: [2, inProgress, 1, resolvedToday] },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Assigned" value={assigned} icon={Bug} />
        <KpiCard
          title="In Progress"
          value={inProgress}
          icon={Clock}
          color="yellow"
        />
        <KpiCard
          title="Resolved Today"
          value={resolvedToday}
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Overdue"
          value={overdue}
          icon={AlertCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Workload Distribution</h3>
          <Chart
            options={workloadOptions}
            series={workloadSeries}
            type="bar"
            height={250}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">SLA Progress</h3>
          <Chart
            options={{
              chart: { type: "donut" },
              labels: ["On Time", "At Risk", "Overdue"],
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
