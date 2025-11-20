import { lazy, Suspense } from "react";
const Chart = lazy(() => import("react-apexcharts"));

export default function ChartCard({ title, type, data }) {
  const options = {
    pie: {
      chart: { type: "donut" },
      labels: data.labels,
      colors: ["#EF4444", "#F59E0B", "#10B981"],
      legend: { position: "bottom" },
      dataLabels: { enabled: false },
    },
    line: {
      chart: { type: "area", toolbar: { show: false } },
      xaxis: { categories: data.categories },
      colors: ["#0EA5A4"],
      stroke: { curve: "smooth" },
      fill: { opacity: 0.1 },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-slate-400">
            Loading chart...
          </div>
        }
      >
        <Chart
          type={type === "pie" ? "donut" : "area"}
          series={type === "pie" ? data.series : data.series}
          options={options[type]}
          height={280}
        />
      </Suspense>
    </div>
  );
}
