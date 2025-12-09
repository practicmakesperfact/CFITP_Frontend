
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Eye,
  Printer,
  Shield,
  ChevronDown,
  Loader2,
  Sparkles,
  Database,
  Activity,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DownloadCloud,
  Settings,
  Zap,
  Bell,
  LineChart,
  Target,
  Award,
  ChartBar,
  ChartLine,
  ChartPie,
  BarChart,
  Download as DownloadIcon,
  ExternalLink,
  CalendarDays,
  AlertTriangle,
  Check,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../api/reportsApi.js";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInDays,
  formatDistanceToNow,
} from "date-fns";
// import CSVExport from "../../components/Reports/CSVExport.jsx";
import ChartCard from "../../components/Dashboard/ChartCard.jsx";
// import StatCard from "../../components/Dashboard/StatCard.jsx";
import { useUIStore } from "../../app/store/uiStore.js";

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const setLoading = useUIStore((state) => state.setLoading);

  // State management
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportType, setReportType] = useState("overview");
  const [activeTab, setActiveTab] = useState("analytics");
  const [exportData, setExportData] = useState([]);
  const [reportId, setReportId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState([
    "issues",
    "performance",
    "feedback",
    "satisfaction",
  ]);
  const [exportFormat, setExportFormat] = useState("excel");

  // Refs for scroll animations
  const headerRef = useRef(null);
  const chartsRef = useRef(null);

  // Date presets with icons
  const datePresets = [
    {
      label: "Today",
      value: "today",
      days: 0,
      icon: <CalendarDays size={14} />,
    },
    {
      label: "Last 7 Days",
      value: "week",
      days: 7,
      icon: <Calendar size={14} />,
    },
    {
      label: "Last 30 Days",
      value: "month",
      days: 30,
      icon: <Calendar size={14} />,
    },
    {
      label: "Last 90 Days",
      value: "quarter",
      days: 90,
      icon: <Calendar size={14} />,
    },
    {
      label: "Last 365 Days",
      value: "year",
      days: 365,
      icon: <Calendar size={14} />,
    },
    {
      label: "Custom Range",
      value: "custom",
      days: null,
      icon: <Settings size={14} />,
    },
  ];

  // Report types with detailed descriptions
  const reportTypes = [
    {
      value: "overview",
      label: "Overview Dashboard",
      description: "High-level metrics and trends",
      icon: <Eye size={16} />,
      color: "teal",
    },
    {
      value: "issues",
      label: "Issues Analysis",
      description: "Detailed issue tracking and resolution",
      icon: <AlertCircle size={16} />,
      color: "orange",
    },
    {
      value: "performance",
      label: "Team Performance",
      description: "Staff productivity and efficiency",
      icon: <TrendingUp size={16} />,
      color: "blue",
    },
    {
      value: "feedback",
      label: "Feedback Analytics",
      description: "Client feedback and satisfaction",
      icon: <Users size={16} />,
      color: "purple",
    },
    {
      value: "audit",
      label: "Audit & Security",
      description: "System logs and security events",
      icon: <Shield size={16} />,
      color: "red",
    },
  ];

  // Metrics cards configuration
  const metricCards = [
    {
      id: "total_issues",
      title: "Total Issues",
      description: "Issues reported in selected period",
      icon: <AlertCircle size={20} />,
      color: "teal",
      trend: true,
      format: "number",
    },
    {
      id: "resolved_issues",
      title: "Resolved Issues",
      description: "Successfully closed issues",
      icon: <CheckCircle size={20} />,
      color: "green",
      trend: true,
      format: "number",
    },
    {
      id: "avg_resolution_time",
      title: "Avg. Resolution Time",
      description: "Average time to resolve issues",
      icon: <Clock size={20} />,
      color: "blue",
      trend: false,
      format: "duration",
    },
    {
      id: "sla_compliance",
      title: "SLA Compliance",
      description: "Service Level Agreement compliance rate",
      icon: <Target size={20} />,
      color: "purple",
      trend: true,
      format: "percentage",
    },
    {
      id: "total_feedback",
      title: "Total Feedback",
      description: "Feedback submissions received",
      icon: <Users size={20} />,
      color: "orange",
      trend: true,
      format: "number",
    },
    {
      id: "satisfaction_score",
      title: "Satisfaction Score",
      description: "Average client satisfaction rating",
      icon: <Award size={20} />,
      color: "pink",
      trend: true,
      format: "percentage",
    },
    {
      id: "active_users",
      title: "Active Users",
      description: "Users active in the system",
      icon: <Activity size={20} />,
      color: "indigo",
      trend: true,
      format: "number",
    },
    {
      id: "avg_response_time",
      title: "Avg. Response Time",
      description: "Average first response time",
      icon: <Zap size={20} />,
      color: "yellow",
      trend: false,
      format: "duration",
    },
  ];

  // Fetch reports data with real-time updates
  const {
    data: reportsData,
    isLoading,
    refetch,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["reports", dateRange, startDate, endDate, reportType],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await reportsApi.getReports({
          period: dateRange,
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
          include_details: true,
          real_time: realTimeUpdates,
        });

        // Process the data
        const processedData = processReportData(response.data);
        return { ...response, processedData };
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: realTimeUpdates ? 30000 : 60000, // 30 seconds for real-time, 1 minute otherwise
    refetchInterval: autoRefresh ? 60000 : false, // Auto-refresh every minute if enabled
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch real-time updates
  const { data: realTimeData } = useQuery({
    queryKey: ["realtime-metrics"],
    queryFn: () => reportsApi.getRealtimeMetrics(),
    enabled: realTimeUpdates,
    refetchInterval: realTimeUpdates ? 10000 : false, // 10 seconds for real-time updates
  });

  // Mutation for PDF generation
  const pdfMutation = useMutation({
    mutationFn: (params) => reportsApi.generatePDFReport(params),
    onMutate: () => {
      setGenerating(true);
      toast.loading(
        <div className="flex flex-col">
          <span className="font-medium">Starting PDF Generation</span>
          <span className="text-sm opacity-75">
            Preparing your comprehensive report...
          </span>
        </div>,
        { duration: 3000 }
      );
    },
    onSuccess: (response) => {
      const { report_id, estimated_completion } = response.data;
      setReportId(report_id);
      toast.dismiss();

      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">PDF Generation Started</span>
          <span className="text-sm opacity-75">
            Estimated completion:{" "}
            {formatDistanceToNow(new Date(estimated_completion))}
          </span>
        </div>
      );

      // Start polling for status
      checkReportStatus(report_id);
    },
    onError: (error) => {
      setGenerating(false);
      toast.dismiss();
      toast.error(
        <div className="flex flex-col">
          <span className="font-medium">PDF Generation Failed</span>
          <span className="text-sm opacity-75">
            {error.message || "Please try again"}
          </span>
        </div>
      );
    },
  });

  // Process report data from API
  const processReportData = (data) => {
    if (!data) return null;

    // Calculate trends and percentages
    const processed = { ...data };

    // Calculate trends for metrics
    if (processed.summary && processed.summary.previous_period) {
      Object.keys(processed.summary.current).forEach((key) => {
        const current = processed.summary.current[key];
        const previous = processed.summary.previous_period[key];

        if (typeof current === "number" && typeof previous === "number") {
          processed.summary.trends = processed.summary.trends || {};
          processed.summary.trends[key] = {
            value: current,
            previous: previous,
            change: ((current - previous) / previous) * 100,
            direction: current >= previous ? "up" : "down",
          };
        }
      });
    }

    // Format dates for display
    if (processed.period) {
      processed.period.formatted = {
        start: format(parseISO(processed.period.start), "MMM dd, yyyy"),
        end: format(parseISO(processed.period.end), "MMM dd, yyyy"),
        duration:
          differenceInDays(
            parseISO(processed.period.end),
            parseISO(processed.period.start)
          ) + 1,
      };
    }

    return processed;
  };

  // Poll for report status
  const checkReportStatus = async (id) => {
    try {
      const statusResponse = await reportsApi.checkReportStatus(id);
      const { status, download_url, error_message, progress } =
        statusResponse.data;

      if (status === "completed") {
        setGenerating(false);

        // Show completion toast
        toast.success(
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div className="flex flex-col">
              <span className="font-medium">PDF Report Ready</span>
              <span className="text-sm opacity-75">
                Click to download your report
              </span>
            </div>
          </div>,
          {
            duration: 5000,
            onClick: () => {
              const link = document.createElement("a");
              link.href = download_url;
              link.download = `CFITP_Report_${format(
                new Date(),
                "yyyy-MM-dd_HHmm"
              )}.pdf`;
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            },
          }
        );

        setReportId(null);

        // Refresh data after report generation
        queryClient.invalidateQueries(["reports"]);
      } else if (status === "failed") {
        setGenerating(false);
        toast.error(
          <div className="flex flex-col">
            <span className="font-medium">PDF Generation Failed</span>
            <span className="text-sm opacity-75">
              {error_message || "Please try again"}
            </span>
          </div>
        );
        setReportId(null);
      } else if (status === "processing") {
        // Update toast with progress
        toast.loading(
          <div className="flex flex-col">
            <span className="font-medium">Generating PDF Report</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress || 0}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{progress || 0}%</span>
            </div>
          </div>,
          { id: "pdf-progress" }
        );

        // Check again in 2 seconds
        setTimeout(() => checkReportStatus(id), 2000);
      }
    } catch (error) {
      console.error("Error checking report status:", error);
      setTimeout(() => checkReportStatus(id), 3000);
    }
  };

  // Handle date preset selection
  const handleDatePreset = (preset) => {
    const today = new Date();
    setDateRange(preset);

    switch (preset) {
      case "today":
        const todayStr = format(today, "yyyy-MM-dd");
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case "week":
        setStartDate(format(subDays(today, 7), "yyyy-MM-dd"));
        setEndDate(format(today, "yyyy-MM-dd"));
        break;
      case "month":
        setStartDate(format(subDays(today, 30), "yyyy-MM-dd"));
        setEndDate(format(today, "yyyy-MM-dd"));
        break;
      case "quarter":
        setStartDate(format(subDays(today, 90), "yyyy-MM-dd"));
        setEndDate(format(today, "yyyy-MM-dd"));
        break;
      case "year":
        setStartDate(format(subDays(today, 365), "yyyy-MM-dd"));
        setEndDate(format(today, "yyyy-MM-dd"));
        break;
      default:
        // Custom - no change
        break;
    }

    if (preset !== "custom") {
      toast.success(
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            Date range set to{" "}
            {datePresets.find((p) => p.value === preset)?.label}
          </span>
        </div>
      );
    }
  };

  // Generate PDF report
  const generatePDFReport = () => {
    const params = {
      report_type: reportType,
      date_range: dateRange,
      start_date: startDate,
      end_date: endDate,
      include_charts: true,
      include_tables: true,
      include_summary: true,
      format: "pdf",
      orientation: "landscape",
      quality: "high",
    };

    pdfMutation.mutate(params);
  };

  // Export to different formats
  const handleExport = async (format) => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} export...`);

      let exportUrl;
      switch (format) {
        case "excel":
          exportUrl = await reportsApi.exportExcel({
            report_type: reportType,
            start_date: startDate,
            end_date: endDate,
          });
          break;
        case "csv":
          exportUrl = await reportsApi.exportCSV({
            report_type: reportType,
            start_date: startDate,
            end_date: endDate,
          });
          break;
        case "json":
          exportUrl = await reportsApi.exportJSON({
            report_type: reportType,
            start_date: startDate,
            end_date: endDate,
          });
          break;
        default:
          throw new Error("Unsupported export format");
      }

      // Trigger download
      const link = document.createElement("a");
      link.href = exportUrl;
      link.download = `CFITP_Report_${reportType}_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.${format}`;
      link.click();

      toast.success(
        <div className="flex items-center gap-2">
          <DownloadCloud className="w-4 h-4" />
          <span>{format.toUpperCase()} export completed</span>
        </div>
      );
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  // Prepare chart data with real-time updates
  const prepareChartData = () => {
    const data = reportsData?.processedData || {};
    const realTime = realTimeData?.data || {};

    // Merge real-time data if available
    const mergedData = { ...data, ...realTime };

    return {
      issuesByStatus: {
        type: "donut",
        data: {
          series: [
            mergedData.issues_by_status?.open || 0,
            mergedData.issues_by_status?.in_progress || 0,
            mergedData.issues_by_status?.resolved || 0,
            mergedData.issues_by_status?.closed || 0,
          ],
          labels: ["Open", "In Progress", "Resolved", "Closed"],
          colors: ["#EF4444", "#F59E0B", "#10B981", "#0EA5A4"],
        },
      },
      issuesByPriority: {
        type: "bar",
        data: {
          series: [
            mergedData.issues_by_priority?.low || 0,
            mergedData.issues_by_priority?.medium || 0,
            mergedData.issues_by_priority?.high || 0,
            mergedData.issues_by_priority?.critical || 0,
          ],
          categories: ["Low", "Medium", "High", "Critical"],
          colors: ["#10B981", "#F59E0B", "#EF4444", "#DC2626"],
        },
      },
      feedbackTrend: {
        type: "line",
        data: {
          series: [
            {
              name: "Feedback Received",
              data: mergedData.feedback_trend?.counts || Array(7).fill(0),
            },
          ],
          categories:
            mergedData.feedback_trend?.dates ||
            Array.from({ length: 7 }, (_, i) =>
              format(subDays(new Date(), 6 - i), "EEE")
            ),
          colors: ["#0EA5A4"],
        },
      },
      teamPerformance: {
        type: "bar",
        data: {
          series:
            mergedData.team_performance?.map(
              (staff) => staff.resolved_issues
            ) || Array(5).fill(0),
          categories: mergedData.team_performance?.map(
            (staff) => staff.name
          ) || ["Alex", "Jamie", "Taylor", "Morgan", "Casey"],
          colors: ["#0EA5A4", "#FB923C", "#10B981", "#8B5CF6", "#EC4899"],
        },
      },
      resolutionTrend: {
        type: "area",
        data: {
          series: [
            {
              name: "Resolution Time (hours)",
              data: mergedData.resolution_trend?.hours || Array(7).fill(24),
            },
          ],
          categories:
            mergedData.resolution_trend?.dates ||
            Array.from({ length: 7 }, (_, i) =>
              format(subDays(new Date(), 6 - i), "EEE")
            ),
          colors: ["#8B5CF6"],
        },
      },
      satisfactionTrend: {
        type: "line",
        data: {
          series: [
            {
              name: "Satisfaction Score",
              data: mergedData.satisfaction_trend?.scores || Array(7).fill(85),
            },
          ],
          categories:
            mergedData.satisfaction_trend?.dates ||
            Array.from({ length: 7 }, (_, i) =>
              format(subDays(new Date(), 6 - i), "EEE")
            ),
          colors: ["#EC4899"],
        },
      },
    };
  };

  // Get metric value with formatting
  const getMetricValue = (metricId) => {
    const data = reportsData?.processedData?.summary?.current || {};
    const trend = reportsData?.processedData?.summary?.trends?.[metricId];

    let value = data[metricId] || 0;

    // Format the value
    if (metricId.includes("time")) {
      return `${value}h`;
    } else if (
      metricId.includes("percentage") ||
      metricId.includes("score") ||
      metricId.includes("compliance")
    ) {
      return `${value}%`;
    } else {
      return value.toLocaleString();
    }
  };

  // Get metric trend indicator
  const getMetricTrend = (metricId) => {
    const trend = reportsData?.processedData?.summary?.trends?.[metricId];
    if (!trend) return null;

    return {
      value: trend.change,
      direction: trend.direction,
      isPositive:
        trend.direction === "up"
          ? metricId.includes("time") || metricId.includes("response")
            ? false
            : true
          : metricId.includes("time") || metricId.includes("response")
          ? true
          : false,
    };
  };

  // Get period display text
  const getPeriodDisplay = () => {
    const period = reportsData?.processedData?.period;
    if (period?.formatted) {
      return `${period.formatted.start} - ${period.formatted.end} (${period.formatted.duration} days)`;
    }
    return `${format(parseISO(startDate), "MMM dd, yyyy")} - ${format(
      parseISO(endDate),
      "MMM dd, yyyy"
    )}`;
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        refetch();
        toast.custom(
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg shadow-lg">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Data refreshed</span>
          </div>,
          { duration: 2000 }
        );
      }, 60000); // Every minute
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const header = headerRef.current;
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add("shadow-lg", "bg-white/95", "backdrop-blur-sm");
        } else {
          header.classList.remove(
            "shadow-lg",
            "bg-white/95",
            "backdrop-blur-sm"
          );
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const chartData = prepareChartData();
  const periodDisplay = getPeriodDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Sticky Header */}
      <motion.div
        ref={headerRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm transition-all duration-300"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-teal-700 to-blue-600 bg-clip-text text-transparent"
              >
                Analytics & Reports
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-1 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>Comprehensive insights and performance metrics</span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline text-teal-600 font-medium">
                  {periodDisplay}
                </span>
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-wrap gap-3"
            >
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  autoRefresh
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Auto-refresh</span>
              </button>

              {/* Export Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-all group-hover:shadow-lg">
                  <DownloadCloud className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Export Format
                    </div>
                    {["excel", "csv", "json", "pdf"].map((format) => (
                      <button
                        key={format}
                        onClick={() =>
                          format === "pdf"
                            ? generatePDFReport()
                            : handleExport(format)
                        }
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gray-100 rounded-lg">
                            <DownloadIcon className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="capitalize">{format} Export</span>
                        </div>
                        <span className="text-xs text-gray-400">.{format}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <button
                onClick={() => {
                  toast.success("Opening print preview...");
                  setTimeout(() => window.print(), 500);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Report Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Report Type
                  </h2>
                  <p className="text-gray-600 ">
                    Select the type of report you want to generate
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {reportTypes.map((type) => (
                    <motion.button
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setReportType(type.value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        reportType === type.value
                          ? `bg-${type.color}-50 border-${type.color}-200 text-${type.color}-700`
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          reportType === type.value
                            ? `bg-${type.color}-100`
                            : "bg-gray-100"
                        }`}
                      >
                        {type.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs opacity-75">
                          {type.description}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Date Range & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Date Range
                  </h2>
                  <p className="text-gray-600">
                    Select the time period for your analysis
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      {periodDisplay}
                    </span>
                  </div>

                  <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-5 h-5 text-gray-600 ${
                        isFetching ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Date Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {datePresets.map((preset) => (
                  <motion.button
                    key={preset.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDatePreset(preset.value)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      dateRange === preset.value
                        ? "bg-teal-600 border-teal-600 text-white shadow-lg"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {preset.icon}
                    <span className="font-medium">{preset.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Custom Date Range */}
              <AnimatePresence>
                {dateRange === "custom" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          max={endDate}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          min={startDate}
                          max={format(new Date(), "yyyy-MM-dd")}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Advanced Filters Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Advanced Filters
                      </div>
                      <div className="text-sm text-gray-600">
                        Apply additional filters to your report
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showAdvancedFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showAdvancedFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-6 bg-gray-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Priority Level
                            </label>
                            <div className="space-y-2">
                              {["low", "medium", "high", "critical"].map(
                                (priority) => (
                                  <label
                                    key={priority}
                                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                                  >
                                    <input
                                      type="checkbox"
                                      className="rounded text-teal-600"
                                    />
                                    <span className="capitalize font-medium">
                                      {priority}
                                    </span>
                                  </label>
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Issue Status
                            </label>
                            <div className="space-y-2">
                              {[
                                "open",
                                "in_progress",
                                "resolved",
                                "closed",
                              ].map((status) => (
                                <label
                                  key={status}
                                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                                >
                                  <input
                                    type="checkbox"
                                    className="rounded text-teal-600"
                                  />
                                  <span className="capitalize font-medium">
                                    {status.replace("_", " ")}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Additional Options
                            </label>
                            <div className="space-y-3">
                              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-medium">
                                  Include Attachments
                                </span>
                                <input type="checkbox" className="toggle" />
                              </label>
                              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-medium">
                                  Real-time Updates
                                </span>
                                <input
                                  type="checkbox"
                                  checked={realTimeUpdates}
                                  onChange={(e) =>
                                    setRealTimeUpdates(e.target.checked)
                                  }
                                  className="toggle"
                                />
                              </label>
                              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <span className="font-medium">
                                  Compare with Previous Period
                                </span>
                                <input type="checkbox" className="toggle" />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                          <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                            Clear Filters
                          </button>
                          <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Dashboard */}
          <motion.div
            ref={chartsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Key Performance Indicators
              </h2>
              <p className="text-gray-600">Live metrics from your database</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metricCards.slice(0, 4).map((metric, index) => {
                const trend = getMetricTrend(metric.id);

                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${metric.color}-100`}>
                        <div className={`text-${metric.color}-600`}>
                          {metric.icon}
                        </div>
                      </div>

                      {trend && (
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            trend.isPositive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trend.isPositive ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownRight size={12} />
                          )}
                          {Math.abs(trend.value).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {getMetricValue(metric.id)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {metric.title}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {metric.description}
                    </div>

                    {realTimeData && (
                      <div className="mt-4 flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-500">Live</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.slice(4).map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index + 4) * 0.1 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-lg bg-${metric.color}-100`}>
                      <div className={`text-${metric.color}-600`}>
                        {metric.icon}
                      </div>
                    </div>
                    <div className="font-medium text-gray-900">
                      {metric.title}
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {getMetricValue(metric.id)}
                  </div>

                  <div className="text-sm text-gray-600">
                    {metric.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Charts Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Visual Analytics
                </h2>
                <p className="text-gray-600">
                  Interactive charts with real-time data
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Settings size={16} />
                  <span>Chart Settings</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <DownloadIcon size={16} />
                  <span>Export Charts</span>
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issues by Status */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <ChartPie className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Issues by Status
                        </h3>
                        <p className="text-sm text-gray-600">
                          Distribution of issues across different statuses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Database size={14} />
                      <span>Live Database</span>
                    </div>
                  </div>
                  <ChartCard
                    title=""
                    type="pie"
                    data={chartData.issuesByStatus.data}
                    isLoading={isLoading}
                    height={300}
                    showHeader={false}
                  />
                </div>
              </motion.div>

              {/* Issues by Priority */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <BarChart className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Issues by Priority
                        </h3>
                        <p className="text-sm text-gray-600">
                          Issue distribution across priority levels
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated just now
                    </div>
                  </div>
                  <ChartCard
                    title=""
                    type="bar"
                    data={chartData.issuesByPriority.data}
                    isLoading={isLoading}
                    height={300}
                    showHeader={false}
                  />
                </div>
              </motion.div>

              {/* Feedback Trend */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ChartLine className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Feedback Trend (7 Days)
                        </h3>
                        <p className="text-sm text-gray-600">
                          Daily feedback submissions over time
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500">Real-time</span>
                    </div>
                  </div>
                  <ChartCard
                    title=""
                    type="line"
                    data={chartData.feedbackTrend.data}
                    isLoading={isLoading}
                    height={300}
                    showHeader={false}
                  />
                </div>
              </motion.div>

              {/* Team Performance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Team Performance
                        </h3>
                        <p className="text-sm text-gray-600">
                          Issues resolved by team members
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                      View Details →
                    </button>
                  </div>
                  <ChartCard
                    title=""
                    type="bar"
                    data={chartData.teamPerformance.data}
                    isLoading={isLoading}
                    height={300}
                    showHeader={false}
                  />
                </div>
              </motion.div>

              {/* Additional Charts Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Resolution Trend */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Resolution Trend
                          </h3>
                          <p className="text-sm text-gray-600">
                            Average resolution time over 7 days
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChartCard
                      title=""
                      type="area"
                      data={chartData.resolutionTrend.data}
                      isLoading={isLoading}
                      height={250}
                      showHeader={false}
                    />
                  </div>
                </div>

                {/* Satisfaction Trend */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Award className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Satisfaction Trend
                          </h3>
                          <p className="text-sm text-gray-600">
                            Client satisfaction score trend
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChartCard
                      title=""
                      type="line"
                      data={chartData.satisfactionTrend.data}
                      isLoading={isLoading}
                      height={250}
                      showHeader={false}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Data Source & Update Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl border border-teal-200 p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Database className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Live Database Connection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Connected to production database • Last updated:{" "}
                    {format(new Date(), "hh:mm:ss a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-teal-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </div>

                <button
                  onClick={() => {
                    refetch();
                    toast.success("Database refreshed successfully");
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">
                  Secure Analytics Dashboard
                </span>
              </div>
              <p className="text-sm text-gray-600">
                All data is encrypted and processed in real-time from your
                database
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Version 2.1.0 • {format(new Date(), "MMMM dd, yyyy")}
              </div>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Need Help?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {(isLoading || generating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {generating ? "Generating Report" : "Loading Analytics"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {generating
                    ? "Your comprehensive PDF report is being generated. This may take a moment..."
                    : "Fetching real-time data from your database..."}
                </p>

                {generating && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <motion.div
                      className="bg-teal-600 h-2 rounded-full"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Please don't close this window
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
