import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

const Chart = lazy(() => import("react-apexcharts"));

export default function ChartCard({
  title,
  type = "line",
  data = {},
  isLoading = false,
  height = 280,
  showHeader = true,
}) {
  // Default data structure for backward compatibility
  const defaultData = {
    series: data?.series || [],
    labels: data?.labels || [],
    categories: data?.categories || [],
    colors: data?.colors || [],
  };

  // Chart options based on type
  const getOptions = () => {
    const baseOptions = {
      chart: {
        type: type === "pie" ? "donut" : type === "bar" ? "bar" : "area",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      colors: defaultData.colors.length
        ? defaultData.colors
        : type === "pie"
        ? ["#EF4444", "#F59E0B", "#10B981", "#0EA5A4", "#8B5CF6"]
        : ["#0EA5A4"],
      dataLabels: {
        enabled: type === "pie",
      },
      stroke: {
        curve: "smooth",
        width: type === "line" || type === "area" ? 3 : 0,
      },
      fill: {
        type: type === "area" ? "gradient" : "solid",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "12px",
        markers: {
          radius: 12,
        },
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
              },
              value: {
                show: true,
                fontSize: "20px",
                fontWeight: 700,
                color: "#1E293B",
                formatter: function (val) {
                  return val;
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#475569",
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                },
              },
            },
          },
        },
        bar: {
          borderRadius: 4,
          columnWidth: "70%",
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 250,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };

    // Add xaxis for line/area/bar charts
    if (type !== "pie") {
      baseOptions.xaxis = {
        categories: defaultData.categories.length
          ? defaultData.categories
          : Array.from(
              { length: defaultData.series?.[0]?.data?.length || 0 },
              (_, i) => `Day ${i + 1}`
            ),
        labels: {
          style: {
            colors: "#64748B",
            fontSize: "12px",
          },
        },
      };
    }

    // Add labels for pie charts
    if (type === "pie") {
      baseOptions.labels = defaultData.labels.length
        ? defaultData.labels
        : ["Category 1", "Category 2", "Category 3"];
    }

    return baseOptions;
  };

  // Prepare series data based on type
  const prepareSeries = () => {
    if (type === "pie") {
      // For pie charts, series should be a simple array
      return defaultData.series.length ? defaultData.series : [30, 40, 30];
    } else {
      // For line/area/bar charts, series should be an array of objects
      if (Array.isArray(defaultData.series) && defaultData.series.length > 0) {
        // Check if series is already in the right format
        if (
          typeof defaultData.series[0] === "object" &&
          defaultData.series[0].data
        ) {
          return defaultData.series;
        } else {
          // Convert simple array to series object
          return [
            {
              name: title || "Data",
              data: defaultData.series,
            },
          ];
        }
      }
      return [{ name: "Data", data: [0, 0, 0, 0, 0] }];
    }
  };

  const options = getOptions();
  const series = prepareSeries();

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {showHeader && (
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        )}
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  // No data state
  const hasData = series.some(
    (s) =>
      Array.isArray(s.data ? s.data : s) &&
      (s.data ? s.data : s).length > 0 &&
      (s.data ? s.data : s).some((v) => v > 0)
  );

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        {showHeader && (
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        )}
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <div className="w-12 h-12 mb-2 text-gray-300">
            {type === "pie" ? "📊" : type === "bar" ? "📈" : "📉"}
          </div>
          <p>No data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      {showHeader && (
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      )}

      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-slate-400">
            Loading chart...
          </div>
        }
      >
        <Chart
          type={type === "pie" ? "donut" : type}
          series={series}
          options={options}
          height={height}
        />
      </Suspense>
    </motion.div>
  );
}
