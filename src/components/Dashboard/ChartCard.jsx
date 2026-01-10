import React from "react";
import ApexChart from "react-apexcharts";

const ChartCard = ({
  title,
  type,
  data,
  height = 300,
  isLoading = false,
  showHeader = true,
  darkMode = false,
}) => {
  // Get default options based on chart type
  const getDefaultOptions = () => {
    const baseOptions = {
      chart: {
        type: type,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      stroke: {
        curve: type === "area" ? "smooth" : "straight",
        width: type === "area" ? 3 : 2,
      },
      fill: {
        type: type === "area" ? "gradient" : "solid",
        gradient:
          type === "area"
            ? {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.1,
                stops: [0, 90, 100],
              }
            : undefined,
      },
      legend: {
        show: type !== "pie" && type !== "donut",
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "12px",
        fontFamily: "inherit",
        fontWeight: 500,
        markers: {
          width: 10,
          height: 10,
          radius: 5,
        },
      },
      dataLabels: {
        enabled: type === "pie" || type === "donut",
        style: {
          fontSize: "12px",
          fontFamily: "inherit",
          fontWeight: 600,
        },
      },
      grid: {
        show: type !== "pie" && type !== "donut",
        borderColor: darkMode ? "#374151" : "#e5e7eb",
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      tooltip: {
        enabled: true,
        theme: darkMode ? "dark" : "light",
        style: {
          fontSize: "12px",
          fontFamily: "inherit",
        },
        y: {
          formatter: (val) => {
            return type === "pie" || type === "donut"
              ? `${val} issues`
              : val.toString();
          },
        },
      },
      colors: data?.colors || [
        "#0EA5A4", // Teal
        "#FB923C", // Orange
        "#10B981", // Emerald
        "#8B5CF6", // Purple
        "#EC4899", // Pink
        "#6366F1", // Indigo
      ],
    };

    // Chart-specific configurations
    if (type === "pie" || type === "donut") {
      return {
        ...baseOptions,
        plotOptions: {
          pie: {
            donut:
              type === "donut"
                ? {
                    size: "70%",
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: "Total",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: darkMode ? "#D1D5DB" : "#374151",
                        formatter: () => {
                          const series = data?.series || [];
                          const total = series.reduce((a, b) => a + b, 0) || 0;
                          return total.toString();
                        },
                      },
                      value: {
                        show: true,
                        fontSize: "28px",
                        fontWeight: 700,
                        color: darkMode ? "#F9FAFB" : "#111827",
                        formatter: (val) => {
                          return val;
                        },
                      },
                    },
                  }
                : undefined,
          },
        },
        labels: data?.labels || [],
        legend: {
          ...baseOptions.legend,
          show: true,
          position: "bottom",
        },
      };
    }

    if (type === "bar") {
      return {
        ...baseOptions,
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "70%",
            borderRadius: 4,
            borderRadiusApplication: "end",
          },
        },
        xaxis: {
          categories: data?.categories || data?.labels || [],
          labels: {
            style: {
              colors: darkMode ? "#9CA3AF" : "#6B7280",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 500,
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: darkMode ? "#9CA3AF" : "#6B7280",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 500,
            },
          },
        },
      };
    }

    if (type === "area" || type === "line") {
      return {
        ...baseOptions,
        xaxis: {
          categories: data?.categories || [],
          labels: {
            style: {
              colors: darkMode ? "#9CA3AF" : "#6B7280",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 500,
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: darkMode ? "#9CA3AF" : "#6B7280",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 500,
            },
          },
        },
        markers: {
          size: 4,
          strokeWidth: 0,
          hover: {
            size: 6,
          },
        },
      };
    }

    return baseOptions;
  };

  // Prepare chart series data - SIMPLIFIED & FIXED
  const prepareSeries = () => {
    if (!data || typeof data !== "object") {
      console.log("ChartCard: No data provided or data is not an object", {
        data,
      });
      return [];
    }

    // For pie/donut charts: data.series should be an array of numbers
    if (type === "pie" || type === "donut") {
      const series = data.series || [];
      if (Array.isArray(series) && series.length > 0) {
        console.log(`ChartCard: Pie chart series prepared`, {
          series,
          labels: data.labels,
        });
        return series;
      }
      console.log("ChartCard: No valid series data for pie chart", { data });
      return [];
    }

    // For bar charts: data.series should be an array of numbers or objects
    if (type === "bar") {
      const series = data.series || [];
      if (Array.isArray(series) && series.length > 0) {
        // Check if already in correct format for grouped bars
        if (
          series[0] &&
          typeof series[0] === "object" &&
          series[0].data !== undefined
        ) {
          console.log(`ChartCard: Bar chart (grouped) series prepared`, {
            series,
          });
          return series;
        } else {
          // Convert simple array to series format
          const formattedSeries = [
            {
              name: title || "Data",
              data: series,
            },
          ];
          console.log(`ChartCard: Bar chart (simple) series prepared`, {
            formattedSeries,
          });
          return formattedSeries;
        }
      }
      console.log("ChartCard: No valid series data for bar chart", { data });
      return [];
    }

    // For area/line charts: data.series should be array of objects
    if (type === "area" || type === "line") {
      const series = data.series || [];
      console.log(`ChartCard: ${type} chart series prepared`, { series });
      return series;
    }

    console.log("ChartCard: Unknown chart type or no data", { type, data });
    return [];
  };

  const options = getDefaultOptions();
  const series = prepareSeries();

  // Loading state
  if (isLoading) {
    return (
      <div className={`h-[${height}px] flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // No data state - check all conditions
  const hasNoData =
    !data ||
    series.length === 0 ||
    (type === "pie" && (!data.labels || data.labels.length === 0)) ||
    (type === "bar" &&
      series[0] &&
      series[0].data &&
      series[0].data.length === 0);

  if (hasNoData) {
    console.log("ChartCard: Showing no data state", {
      hasData: !!data,
      seriesLength: series.length,
      type,
      data,
    });

    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-gray-400 mb-2">
          {type === "pie" || type === "donut" ? (
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Data</span>
            </div>
          ) : (
            <div className="w-full h-40 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
              <span className="text-gray-500">No data available</span>
            </div>
          )}
        </div>
        <p className="text-gray-500 text-sm text-center">
          No chart data to display
        </p>
        {!data && (
          <p className="text-gray-400 text-xs mt-1">Data object is undefined</p>
        )}
      </div>
    );
  }

  console.log("ChartCard: Rendering chart", {
    type,
    seriesLength: series.length,
    options,
    data,
  });

  return (
    <div className="w-full">
      {showHeader && title && (
        <div className="mb-4">
          <h3
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
        </div>
      )}

      <div style={{ height: `${height}px` }}>
        <ApexChart
          options={options}
          series={series}
          type={type}
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};

export default ChartCard;
