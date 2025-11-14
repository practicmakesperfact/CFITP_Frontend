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
      chart: { type },
      labels: categories,
      theme: { mode: "dark" },
      colors: ["#0EA5A4", "#FB923C", "#334155"],
    });
  }, [type, categories]);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-text mb-4">{title}</h3>
      <ReactApexChart
        options={options}
        series={data}
        type={type}
        height={250}
      />
    </motion.div>
  );
}
