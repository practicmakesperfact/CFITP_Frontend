import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "../../api/issuesApi.js";
import KpiCard from "../../components/Dashboard/KpiCard.jsx";
import { Bug, CheckCircle, MessageSquare } from "lucide-react";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";

export default function ClientDashboard() {
  const { data: issues } = useQuery({
    queryKey: ["issues", { reporter: "me" }],
    queryFn: () => issuesApi.list({ reporter: "me" }),
  });

  const open = issues?.data?.filter((i) => i.status === "open").length || 0;
  const resolved =
    issues?.data?.filter((i) => i.status === "resolved").length || 0;

  const chartOptions = {
    chart: { type: "pie" },
    labels: ["Open", "In Progress", "Resolved", "Closed"],
    colors: ["#FB923C", "#FBBF24", "#10B981", "#0EA5A4"],
    legend: { position: "bottom" },
  };

  const series = [open, 5, resolved, 3];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-8">Welcome back, Client!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Open Issues" value={open} icon={Bug} />
        <KpiCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Feedback Sent"
          value="12"
          icon={MessageSquare}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Issue Status Overview</h3>
          <Chart
            options={chartOptions}
            series={series}
            type="pie"
            height={300}
          />
        </div>
      </div>
    </motion.div>
  );
}
