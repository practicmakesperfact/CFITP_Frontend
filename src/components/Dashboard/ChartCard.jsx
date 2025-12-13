// import { lazy, Suspense } from "react";
// import { motion } from "framer-motion";

// const Chart = lazy(() => import("react-apexcharts"));

// export default function ChartCard({
//   title,
//   type = "line",
//   data = {},
//   isLoading = false,
//   height = 280,
//   showHeader = true,
// }) {
//   // Default data structure for backward compatibility
//   const defaultData = {
//     series: data?.series || [],
//     labels: data?.labels || [],
//     categories: data?.categories || [],
//     colors: data?.colors || [],
//   };

//   // Chart options based on type
//   const getOptions = () => {
//     const baseOptions = {
//       chart: {
//         type: type === "pie" ? "donut" : type === "bar" ? "bar" : "area",
//         toolbar: {
//           show: true,
//           tools: {
//             download: true,
//             selection: false,
//             zoom: false,
//             zoomin: false,
//             zoomout: false,
//             pan: false,
//             reset: false,
//           },
//         },
//         animations: {
//           enabled: true,
//           easing: "easeinout",
//           speed: 800,
//         },
//       },
//       colors: defaultData.colors.length
//         ? defaultData.colors
//         : type === "pie"
//         ? ["#EF4444", "#F59E0B", "#10B981", "#0EA5A4", "#8B5CF6"]
//         : ["#0EA5A4"],
//       dataLabels: {
//         enabled: type === "pie",
//       },
//       stroke: {
//         curve: "smooth",
//         width: type === "line" || type === "area" ? 3 : 0,
//       },
//       fill: {
//         type: type === "area" ? "gradient" : "solid",
//         gradient: {
//           shadeIntensity: 1,
//           opacityFrom: 0.7,
//           opacityTo: 0.9,
//         },
//       },
//       legend: {
//         position: "bottom",
//         horizontalAlign: "center",
//         fontSize: "12px",
//         markers: {
//           radius: 12,
//         },
//       },
//       tooltip: {
//         theme: "light",
//         y: {
//           formatter: function (val) {
//             return val;
//           },
//         },
//       },
//       plotOptions: {
//         pie: {
//           donut: {
//             size: "70%",
//             labels: {
//               show: true,
//               name: {
//                 show: true,
//                 fontSize: "14px",
//                 fontWeight: 600,
//                 color: "#475569",
//               },
//               value: {
//                 show: true,
//                 fontSize: "20px",
//                 fontWeight: 700,
//                 color: "#1E293B",
//                 formatter: function (val) {
//                   return val;
//                 },
//               },
//               total: {
//                 show: true,
//                 label: "Total",
//                 color: "#475569",
//                 formatter: function (w) {
//                   return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
//                 },
//               },
//             },
//           },
//         },
//         bar: {
//           borderRadius: 4,
//           columnWidth: "70%",
//         },
//       },
//       responsive: [
//         {
//           breakpoint: 768,
//           options: {
//             chart: {
//               height: 250,
//             },
//             legend: {
//               position: "bottom",
//             },
//           },
//         },
//       ],
//     };

//     // Add xaxis for line/area/bar charts
//     if (type !== "pie") {
//       baseOptions.xaxis = {
//         categories: defaultData.categories.length
//           ? defaultData.categories
//           : Array.from(
//               { length: defaultData.series?.[0]?.data?.length || 0 },
//               (_, i) => `Day ${i + 1}`
//             ),
//         labels: {
//           style: {
//             colors: "#64748B",
//             fontSize: "12px",
//           },
//         },
//       };
//     }

//     // Add labels for pie charts
//     if (type === "pie") {
//       baseOptions.labels = defaultData.labels.length
//         ? defaultData.labels
//         : ["Category 1", "Category 2", "Category 3"];
//     }

//     return baseOptions;
//   };

//   // Prepare series data based on type
//   const prepareSeries = () => {
//     if (type === "pie") {
//       // For pie charts, series should be a simple array
//       return defaultData.series.length ? defaultData.series : [30, 40, 30];
//     } else {
//       // For line/area/bar charts, series should be an array of objects
//       if (Array.isArray(defaultData.series) && defaultData.series.length > 0) {
//         // Check if series is already in the right format
//         if (
//           typeof defaultData.series[0] === "object" &&
//           defaultData.series[0].data
//         ) {
//           return defaultData.series;
//         } else {
//           // Convert simple array to series object
//           return [
//             {
//               name: title || "Data",
//               data: defaultData.series,
//             },
//           ];
//         }
//       }
//       return [{ name: "Data", data: [0, 0, 0, 0, 0] }];
//     }
//   };

//   const options = getOptions();
//   const series = prepareSeries();

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         {showHeader && (
//           <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
//         )}
//         <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
//       </div>
//     );
//   }

//   // No data state
//   const hasData = series.some(
//     (s) =>
//       Array.isArray(s.data ? s.data : s) &&
//       (s.data ? s.data : s).length > 0 &&
//       (s.data ? s.data : s).some((v) => v > 0)
//   );

//   if (!hasData) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
//       >
//         {showHeader && (
//           <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
//         )}
//         <div className="h-64 flex flex-col items-center justify-center text-gray-500">
//           <div className="w-12 h-12 mb-2 text-gray-300">
//             {type === "pie" ? "📊" : type === "bar" ? "📈" : "📉"}
//           </div>
//           <p>No data available</p>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
//     >
//       {showHeader && (
//         <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
//       )}

//       <Suspense
//         fallback={
//           <div className="h-64 flex items-center justify-center text-slate-400">
//             Loading chart...
//           </div>
//         }
//       >
//         <Chart
//           type={type === "pie" ? "donut" : type}
//           series={series}
//           options={options}
//           height={height}
//         />
//       </Suspense>
//     </motion.div>
//   );
// }

// src/components/Dashboard/ChartCard.jsx
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const ChartCard = ({
  title = "",
  type = "bar",
  data,
  isLoading = false,
  height = 300,
  showHeader = true,
  options = {},
}) => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: type === "pie" ? "donut" : type,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: type === "pie" || type === "donut" ? false : true,
          zoomin: type === "pie" || type === "donut" ? false : true,
          zoomout: type === "pie" || type === "donut" ? false : true,
          pan: false,
          reset: type === "pie" || type === "donut" ? false : true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    colors: data?.colors || ["#0EA5A4"],
    xaxis: {
      categories: data?.categories || [],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
        formatter: function (value) {
          return Math.floor(value);
        },
      },
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      fontFamily: "Inter, sans-serif",
      labels: {
        colors: "#374151",
      },
    },
    dataLabels: {
      enabled: type === "pie" || type === "donut",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        colors: ["#fff"],
        fontWeight: 600,
      },
      formatter: function (val, opts) {
        if (type === "pie" || type === "donut") {
          // Get the total of all series values
          const seriesTotals = opts.w.globals.seriesTotals || [];
          const total = seriesTotals.reduce((a, b) => Number(a) + Number(b), 0);
          
          // Ensure val is a number
          const value = Number(val);
          
          // Calculate percentage (out of 100%)
          if (total > 0) {
            const percentage = Math.round((value / total) * 100);
            // Only show percentage if slice is large enough (> 5%)
            return percentage > 5 ? `${percentage}%` : "";
          }
          return "";
        }
        return val;
      },
    },
    stroke: {
      curve: type === "line" ? "smooth" : "straight",
      width: type === "area" ? 3 : 2,
    },
    fill: {
      type: type === "area" ? "gradient" : "solid",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
        distributed: type === "bar" && data?.categories?.length > 0,
      },
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              color: "#6B7280",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
              formatter: function (val) {
                return val;
              },
            },
            total: {
              show: true,
              label: "Total",
              color: "#6B7280",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    ...options,
  });

  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    // Handle pie/donut charts differently - they need a simple array
    if (type === "pie" || type === "donut") {
      if (data?.series && Array.isArray(data.series)) {
        // For pie charts, series should be a simple array of numbers
        setChartSeries(data.series);
      } else {
        setChartSeries([0, 0, 0]);
      }
    } else {
      // Handle line/bar/area charts
      if (data?.series && Array.isArray(data.series)) {
        // If series is an array of objects (multi-series)
        if (typeof data.series[0] === "object" && data.series[0].name !== undefined) {
          setChartSeries(data.series);
        } else {
          // If series is a single array of values
          setChartSeries([
            {
              name: title || "Data",
              data: data.series,
            },
          ]);
        }
      } else if (data?.series && !Array.isArray(data.series)) {
        // If series is a single value array
        setChartSeries([
          {
            name: title || "Data",
            data: [data.series],
          },
        ]);
      } else {
        // Default empty series
        setChartSeries([
          {
            name: "No Data",
            data: [0],
          },
        ]);
      }
    }

    // Update chart options with data
    setChartOptions((prev) => ({
      ...prev,
      colors: data?.colors || prev.colors,
      labels: type === "pie" || type === "donut" ? (data?.labels || []) : prev.labels,
      xaxis: {
        ...prev.xaxis,
        categories: data?.categories || prev.xaxis.categories,
      },
    }));
  }, [data, title, type]);

  // Check if we have valid data
  const hasValidData = type === "pie" || type === "donut"
    ? Array.isArray(chartSeries) && chartSeries.some((value) => value > 0)
    : chartSeries.some((series) => 
        Array.isArray(series.data) && series.data.some((value) => value > 0)
      );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">Loading chart data...</p>
              </div>
            </div>
          </div>
        )}
        <div
          className="flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-48 w-full bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasValidData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">No data available</p>
              </div>
            </div>
          </div>
        )}
        <div
          className="flex flex-col items-center justify-center text-gray-500"
          style={{ height: `${height}px` }}
        >
          <AlertCircle className="w-12 h-12 mb-3" />
          <p className="text-lg font-medium">No Data Available</p>
          <p className="text-sm mt-1">
            There is no data to display for this chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">
                {type === "pie" || type === "donut"
                  ? "Percentage distribution"
                  : "Real-time metrics"}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Updated just now
          </div>
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <ReactApexChart
          options={chartOptions}
          series={type === "pie" || type === "donut" ? chartSeries : chartSeries}
          type={type === "pie" ? "donut" : type}
          height={height}
        />
      </div>
    </motion.div>
  );
};

export default ChartCard;