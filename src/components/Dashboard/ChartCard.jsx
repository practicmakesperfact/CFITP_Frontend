import ReactApexChart from "react-apexcharts";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ChartCard({
  title,
  type = "pie",
  data = [],
  categories = [],
}) {
  const [options, setOptions] = useState({});

  useEffect(() => {
    setOptions({
      chart: { type, toolbar: { show: false } },
      labels: categories,
      theme: { mode: "light" },
      colors: ["#0EA5A4", "#FB923C", "#334155"],
      stroke: { width: 2 },
      legend: { position: "bottom" },
    });
  }, [type, categories]);

  return (
    <motion.div
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      <ReactApexChart
        options={options}
        series={data}
        type={type}
        height={250}
      />
    </motion.div>
  );
}
