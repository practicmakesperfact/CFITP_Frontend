// src/pages/Reports/ReportsPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ArrowUpRight,
  ArrowDownRight,
  DownloadCloud,
  Settings,
  Zap,
  Target,
  Award,
  ChartBar,
  ChartLine,
  ChartPie,
  BarChart,
  CalendarDays,
  Check,
  FileBarChart,
  TrendingDown,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  History,
  AlertTriangle,
  Users as UsersIcon,
  MessageSquare,
  ThumbsUp,
  Star,
  Activity as ActivityIcon,
  X,
  Plus,
  Search,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../api/reportsApi.js";
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInDays,
  formatDistanceToNow,
  isAfter,
  isBefore,
  addDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import ChartCard from "../../components/Dashboard/ChartCard.jsx";
import { useUIStore } from "../../app/store/uiStore.js";
import { saveAs } from "file-saver";

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const setLoading = useUIStore((state) => state.setLoading);
  const userRole = useUIStore((state) => state.userRole);

  // State management
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [reportType, setReportType] = useState("issues_by_status");
  const [reportFormat, setReportFormat] = useState("excel");
  const [activeTab, setActiveTab] = useState("analytics");
  const [reportId, setReportId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [exportFormat, setExportFormat] = useState("excel");
  const [generatedReports, setGeneratedReports] = useState([]);
  const [filters, setFilters] = useState({
    priority: [],
    status: [],
    assignee: [],
    includeAttachments: false,
    comparePeriod: false,
  });

  // Refs
  const headerRef = useRef(null);

  // Report types
  const reportTypes = [
    {
      value: "issues_by_status",
      label: "Issues by Status",
      description: "Distribution of issues across different statuses",
      icon: <PieChartIcon size={16} />,
      color: "teal",
    },
    {
      value: "issues_by_assignee",
      label: "Issues by Assignee",
      description: "Issues assigned to team members",
      icon: <UsersIcon size={16} />,
      color: "blue",
    },
    {
      value: "issues_by_priority",
      label: "Issues by Priority",
      description: "Issue distribution by priority levels",
      icon: <AlertTriangle size={16} />,
      color: "orange",
    },
    {
      value: "feedback_summary",
      label: "Feedback Summary",
      description: "Client feedback and satisfaction analysis",
      icon: <MessageSquare size={16} />,
      color: "purple",
    },
    {
      value: "team_performance",
      label: "Team Performance",
      description: "Staff performance and efficiency metrics",
      icon: <ActivityIcon size={16} />,
      color: "green",
    },
  ];

  // Date presets
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

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
    error: analyticsError,
    isFetching: analyticsFetching,
  } = useQuery({
    queryKey: ["analytics", dateRange, startDate, endDate, reportType, filters],
    queryFn: async () => {
      setLoading(true);
      try {
        const params = {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        };

        // Add filters to params
        if (filters.priority.length > 0) {
          params.priority = filters.priority.join(",");
        }
        if (filters.status.length > 0) {
          params.status = filters.status.join(",");
        }

        const response = await reportsApi.getAnalyticsData(params);
        return response.data;
      } catch (err) {
        console.error("Error fetching analytics:", err);
        toast.error("Failed to load analytics data");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
    retry: 2,
  });

  // Fetch real-time metrics
  const {
    data: realTimeData,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["realtime-metrics"],
    queryFn: () => reportsApi.getRealtimeMetrics(),
    enabled: realTimeUpdates,
    refetchInterval: realTimeUpdates ? 10000 : false,
    staleTime: 0,
  });

  // Fetch generated reports
  const {
    data: reportsList,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["generated-reports"],
    queryFn: () => reportsApi.getReports(),
    enabled: true,
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: (data) => reportsApi.createReport(data),
    onMutate: () => {
      setGenerating(true);
      toast.loading("Starting report generation...", {
        id: "report-generation",
      });
    },
    onSuccess: (response) => {
      const report = response.data;
      setReportId(report.id);

      toast.success("Report generation started!", {
        id: "report-generation",
      });

      // Start polling for status
      pollReportStatus(report.id);

      // Refresh reports list
      setTimeout(() => refetchReports(), 2000);
    },
    onError: (error) => {
      setGenerating(false);
      toast.error(
        `Failed to create report: ${
          error.response?.data?.detail || error.message
        }`,
        {
          id: "report-generation",
        }
      );
    },
  });

  // Poll for report status
  const pollReportStatus = useCallback(
    async (id) => {
      try {
        const response = await reportsApi.getReportStatus(id);
        const report = response.data;

        if (report.status === "generated" && report.result_available) {
          setGenerating(false);

          toast.success(
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex flex-col">
                <span className="font-medium">Report Ready!</span>
                <span className="text-sm opacity-75">
                  Click here to download
                </span>
              </div>
            </div>,
            {
              duration: 5000,
              onClick: () => handleDownloadReportById(id),
            }
          );

          setReportId(null);
          refetchReports();
        } else if (report.status === "failed") {
          setGenerating(false);
          toast.error(
            <div className="flex flex-col">
              <span className="font-medium">Report Generation Failed</span>
              <span className="text-sm opacity-75">
                Please try again or contact support
              </span>
            </div>
          );
          setReportId(null);
        } else if (
          report.status === "pending" ||
          report.status === "processing"
        ) {
          // Still processing, check again in 3 seconds
          setTimeout(() => pollReportStatus(id), 3000);
        }
      } catch (error) {
        console.error("Error polling report status:", error);
        setTimeout(() => pollReportStatus(id), 5000);
      }
    },
    [refetchReports]
  );

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
        setStartDate(format(subMonths(today, 3), "yyyy-MM-dd"));
        setEndDate(format(today, "yyyy-MM-dd"));
        break;
      case "year":
        setStartDate(format(subMonths(today, 12), "yyyy-MM-dd"));
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

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterType === "priority" || filterType === "status") {
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(
            (item) => item !== value
          );
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
      } else {
        newFilters[filterType] = value;
      }
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priority: [],
      status: [],
      assignee: [],
      includeAttachments: false,
      comparePeriod: false,
    });
    toast.success("All filters cleared");
  };

  // Apply filters
  const applyFilters = () => {
    refetchAnalytics();
    toast.success("Filters applied successfully");
  };

  // Generate PDF/Excel/CSV report
  const generateReport = (format = "excel") => {
    const reportData = {
      type: reportType,
      format: format,
      parameters: {
        start_date: startDate,
        end_date: endDate,
        date_range: dateRange,
        ...filters,
      },
    };

    createReportMutation.mutate(reportData);
  };

  // Quick export (sync)
  const handleQuickExport = async (format) => {
    try {
      toast.loading(`Generating ${format.toUpperCase()} export...`);

      const params = {
        start_date: startDate,
        end_date: endDate,
        report_type: reportType,
      };

      let exportFunction;
      let filename;
      let contentType;

      switch (format) {
        case "excel":
          exportFunction = reportsApi.exportExcel;
          filename = `CFITP_Report_${reportType}_${format(
            new Date(),
            "yyyy-MM-dd"
          )}.xlsx`;
          contentType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        case "csv":
          exportFunction = reportsApi.exportCSV;
          filename = `CFITP_Report_${reportType}_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          contentType = "text/csv";
          break;
        case "json":
          exportFunction = reportsApi.exportJSON;
          filename = `CFITP_Report_${reportType}_${format(
            new Date(),
            "yyyy-MM-dd"
          )}.json`;
          contentType = "application/json";
          break;
        default:
          throw new Error("Unsupported format");
      }

      const response = await exportFunction(params);

      // Handle blob response
      const blob = new Blob([response.data], { type: contentType });
      saveAs(blob, filename);

      toast.success(`${format.toUpperCase()} export completed!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Export failed: ${error.message}`);
    }
  };

  // Download report by ID
  const handleDownloadReportById = async (reportId) => {
    try {
      const response = await reportsApi.downloadReport(reportId);

      // Extract filename from content-disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = `report_${reportId}.${reportFormat}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      saveAs(blob, filename);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report");
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!analyticsData) {
      return {
        issuesByStatus: {
          type: "pie",
          data: { series: [], labels: [], colors: [] },
        },
        issuesByPriority: {
          type: "bar",
          data: { series: [], categories: [], colors: [] },
        },
        teamPerformance: {
          type: "bar",
          data: { series: [], categories: [], colors: [] },
        },
        resolutionTrend: {
          type: "area",
          data: { series: [], categories: [], colors: [] },
        },
        satisfactionTrend: {
          type: "line",
          data: { series: [], categories: [], colors: [] },
        },
      };
    }

    const data = analyticsData;

    // Issues by Status chart
    const issuesByStatus = {
      type: "pie",
      data: {
        series: data.issues_by_status?.map((item) => item.count) || [],
        labels:
          data.issues_by_status?.map((item) =>
            item.status.replace("_", " ").toUpperCase()
          ) || [],
        colors: ["#EF4444", "#F59E0B", "#10B981", "#0EA5A4", "#8B5CF6"],
      },
    };

    // Issues by Priority chart
    const issuesByPriority = {
      type: "bar",
      data: {
        series: data.issues_by_priority?.map((item) => item.count) || [],
        categories:
          data.issues_by_priority?.map((item) => item.priority.toUpperCase()) ||
          [],
        colors: ["#10B981", "#F59E0B", "#EF4444", "#DC2626"],
      },
    };

    // Team Performance chart
    const teamPerformanceData = data.team_performance || [];
    const teamPerformance = {
      type: "bar",
      data: {
        series: [
          {
            name: "Total Assigned",
            data: teamPerformanceData.map(
              (member) => member.total_assigned || 0
            ),
          },
          {
            name: "Resolved",
            data: teamPerformanceData.map((member) => member.resolved || 0),
          },
        ],
        categories: teamPerformanceData.map(
          (member) => member.name || "Unknown"
        ),
        colors: ["#0EA5A4", "#FB923C"],
      },
    };

    // Daily trend chart
    const dailyTrend = data.trends?.daily || [];
    const resolutionTrend = {
      type: "area",
      data: {
        series: [
          {
            name: "Daily Issues",
            data: dailyTrend.map((day) => day.issues || 0),
          },
        ],
        categories: dailyTrend.map((day) => day.day_name || "Day"),
        colors: ["#8B5CF6"],
      },
    };

    // Satisfaction trend
    const satisfactionTrend = {
      type: "line",
      data: {
        series: [
          {
            name: "Satisfaction Score",
            data: dailyTrend.map((day) => day.feedback_avg || 0),
          },
        ],
        categories: dailyTrend.map((day) => day.day_name || "Day"),
        colors: ["#EC4899"],
      },
    };

    return {
      issuesByStatus,
      issuesByPriority,
      teamPerformance,
      resolutionTrend,
      satisfactionTrend,
    };
  };

  // Get metric value
 
  const getMetricValue = (metricName) => {
    if (!analyticsData?.summary) return { value: 0, formatted: "0" };

    let rawValue = analyticsData.summary[metricName];

    // Handle cases where backend returns string like "24.5h" or "92.3%"
    if (typeof rawValue === "string") {
      rawValue = parseFloat(rawValue.replace(/[^0-9.]/g, ""));
    }

    if (rawValue === undefined || rawValue === null || isNaN(rawValue)) {
      rawValue = 0;
    }

    let formatted = rawValue.toLocaleString();

    if (metricName.includes("time") || metricName.includes("resolution")) {
      formatted = `${rawValue.toFixed(1)}h`;
    } else if (
      metricName.includes("percentage") ||
      metricName.includes("compliance") ||
      metricName.includes("satisfaction")
    ) {
      formatted = `${rawValue.toFixed(1)}%`;
    }

    return { value: rawValue, formatted };
  };

  // Get period display
  const getPeriodDisplay = () => {
    if (analyticsData?.period_display) {
      return analyticsData.period_display;
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
        refetchAnalytics();
        refetchMetrics();
        toast.custom(
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg shadow-lg">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Data refreshed</span>
          </div>,
          { duration: 2000 }
        );
      }, 60000); // Refresh every minute
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refetchAnalytics, refetchMetrics]);

  // Load generated reports
  useEffect(() => {
    if (reportsList?.data?.results) {
      setGeneratedReports(reportsList.data.results);
    } else if (reportsList?.data) {
      setGeneratedReports(reportsList.data);
    }
  }, [reportsList]);

  // Poll active report
  useEffect(() => {
    if (reportId) {
      pollReportStatus(reportId);
    }
  }, [reportId, pollReportStatus]);

  const chartData = prepareChartData();
  const periodDisplay = getPeriodDisplay();

  // Summary metrics cards
  const summaryMetrics = [
    {
      id: "total_issues",
      title: "Total Issues",
      value: getMetricValue("total_issues").formatted,
      description: "Issues reported in selected period",
      icon: <AlertCircle size={20} />,
      color: "teal",
      trend: analyticsData?.summary?.total_issues > 0,
    },
    {
      id: "resolved_issues",
      title: "Resolved Issues",
      value: getMetricValue("resolved_issues").formatted,
      description: "Successfully closed issues",
      icon: <CheckCircle size={20} />,
      color: "green",
      trend: true,
    },
    {
      id: "open_issues",
      title: "Open Issues",
      value: getMetricValue("open_issues").formatted,
      description: "Currently open issues",
      icon: <AlertTriangle size={20} />,
      color: "red",
      trend: false,
    },
    {
      id: "avg_resolution_time",
      title: "Avg. Resolution Time",
      value: getMetricValue("avg_resolution_time").formatted,
      description: "Average time to resolve issues",
      icon: <Clock size={20} />,
      color: "blue",
      trend: false,
    },
    {
      id: "sla_compliance",
      title: "SLA Compliance",
      value: getMetricValue("sla_compliance").formatted,
      description: "Service Level Agreement compliance rate",
      icon: <Target size={20} />,
      color: "purple",
      trend: true,
    },
    {
      id: "total_feedback",
      title: "Total Feedback",
      value: getMetricValue("total_feedback").formatted,
      description: "Feedback submissions received",
      icon: <MessageSquare size={20} />,
      color: "orange",
      trend: true,
    },
    {
      id: "avg_satisfaction",
      title: "Avg. Satisfaction",
      value: getMetricValue("avg_satisfaction").formatted,
      description: "Average client satisfaction rating",
      icon: <Star size={20} />,
      color: "pink",
      trend: true,
    },
    {
      id: "active_users",
      title: "Active Users",
      value: getMetricValue("active_users").formatted,
      description: "Users active in the system",
      icon: <UsersIcon size={20} />,
      color: "indigo",
      trend: true,
    },
  ];

  // Check if data is empty
  const isEmptyData = !analyticsData || Object.keys(analyticsData).length === 0;

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
                      Quick Export
                    </div>
                    {["excel", "csv", "json"].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleQuickExport(format)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                        disabled={analyticsLoading}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="capitalize">{format} Export</span>
                        </div>
                        <span className="text-xs text-gray-400">.{format}</span>
                      </button>
                    ))}
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider mt-2">
                      Generate Report
                    </div>
                    {["pdf", "excel", "csv"].map((format) => (
                      <button
                        key={`gen-${format}`}
                        onClick={() => generateReport(format)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                        disabled={generating}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-teal-100 rounded-lg">
                            <FileText className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="capitalize">
                            Generate {format.toUpperCase()}
                          </span>
                        </div>
                        {generating && format === reportFormat && (
                          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                        )}
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
        {/* Error State */}
        {analyticsError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">
                    Failed to Load Analytics
                  </h3>
                  <p className="text-red-700 mt-1">
                    {analyticsError.response?.data?.detail ||
                      analyticsError.message}
                  </p>
                  <button
                    onClick={() => refetchAnalytics()}
                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {isEmptyData && !analyticsLoading && !analyticsError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No Data Available
              </h3>
              <p className="text-gray-600 mb-6">
                There's no analytics data available for the selected period. Try
                adjusting your date range or check back later when data has been
                collected.
              </p>
              <button
                onClick={() => {
                  setStartDate(format(subDays(new Date(), 30), "yyyy-MM-dd"));
                  setEndDate(format(new Date(), "yyyy-MM-dd"));
                  setDateRange("month");
                }}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Load Last 30 Days
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!isEmptyData && (
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
                    <p className="text-gray-600">
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
                      onClick={() => refetchAnalytics()}
                      disabled={analyticsFetching}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-5 h-5 text-gray-600 ${
                          analyticsFetching ? "animate-spin" : ""
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
                                        checked={filters.priority.includes(
                                          priority
                                        )}
                                        onChange={() =>
                                          handleFilterChange(
                                            "priority",
                                            priority
                                          )
                                        }
                                        className="rounded text-teal-600 focus:ring-teal-500"
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
                                      checked={filters.status.includes(status)}
                                      onChange={() =>
                                        handleFilterChange("status", status)
                                      }
                                      className="rounded text-teal-600 focus:ring-teal-500"
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
                                  <input
                                    type="checkbox"
                                    checked={filters.includeAttachments}
                                    onChange={(e) =>
                                      handleFilterChange(
                                        "includeAttachments",
                                        e.target.checked
                                      )
                                    }
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                  />
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
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <span className="font-medium">
                                    Compare with Previous Period
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={filters.comparePeriod}
                                    onChange={(e) =>
                                      handleFilterChange(
                                        "comparePeriod",
                                        e.target.checked
                                      )
                                    }
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex justify-end gap-3">
                            <button
                              onClick={clearFilters}
                              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                              Clear Filters
                            </button>
                            <button
                              onClick={applyFilters}
                              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                            >
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
                {summaryMetrics.slice(0, 4).map((metric, index) => (
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

                      {realTimeData && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500">Live</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {metric.title}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {metric.description}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryMetrics.slice(4).map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (index + 4) * 0.1 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`p-2.5 rounded-lg bg-${metric.color}-100`}
                      >
                        <div className={`text-${metric.color}-600`}>
                          {metric.icon}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        {metric.title}
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
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
                  <button
                    onClick={() => {
                      refetchAnalytics();
                      toast.success("Charts refreshed");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw size={16} />
                    <span>Refresh Charts</span>
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
                    {chartData.issuesByStatus.data.labels.length > 0 ? (
                      <ChartCard
                        title=""
                        type="pie"
                        data={chartData.issuesByStatus.data}
                        isLoading={analyticsLoading}
                        height={300}
                        showHeader={false}
                      />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No status data available
                      </div>
                    )}
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
                        Updated: {format(new Date(), "hh:mm a")}
                      </div>
                    </div>
                    {chartData.issuesByPriority.data.categories.length > 0 ? (
                      <ChartCard
                        title=""
                        type="bar"
                        data={chartData.issuesByPriority.data}
                        isLoading={analyticsLoading}
                        height={300}
                        showHeader={false}
                      />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No priority data available
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Team Performance */}
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
                          <UsersIcon className="w-5 h-5 text-blue-600" />
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
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Real-time</span>
                      </div>
                    </div>
                    {chartData.teamPerformance.data.categories.length > 0 ? (
                      <ChartCard
                        title=""
                        type="bar"
                        data={chartData.teamPerformance.data}
                        isLoading={analyticsLoading}
                        height={300}
                        showHeader={false}
                      />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No team performance data available
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Daily Trend */}
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
                            Daily Trend
                          </h3>
                          <p className="text-sm text-gray-600">
                            Issues and feedback over time
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReportType("team_performance")}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                    {chartData.resolutionTrend.data.categories.length > 0 ? (
                      <ChartCard
                        title=""
                        type="area"
                        data={chartData.resolutionTrend.data}
                        isLoading={analyticsLoading}
                        height={300}
                        showHeader={false}
                      />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No trend data available
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Generated Reports Section */}
            {generatedReports.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Generated Reports
                      </h2>
                      <p className="text-gray-600">
                        Your previously generated reports
                      </p>
                    </div>
                    <button
                      onClick={refetchReports}
                      disabled={reportsLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                      <RefreshCw
                        size={16}
                        className={reportsLoading ? "animate-spin" : ""}
                      />
                      Refresh
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Report Type
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Created
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReports.slice(0, 5).map((report) => (
                          <tr
                            key={report.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                  {reportTypes.find(
                                    (t) => t.value === report.type
                                  )?.icon || <FileText size={16} />}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {report.type_display || report.type}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {report.format_display || report.format}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  report.status === "generated"
                                    ? "bg-green-100 text-green-800"
                                    : report.status === "pending" ||
                                      report.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {report.status_display || report.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {format(
                                new Date(report.created_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {report.status === "generated" && (
                                  <button
                                    onClick={() =>
                                      handleDownloadReportById(report.id)
                                    }
                                    className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                                  >
                                    Download
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    // View report details
                                    toast.info(
                                      `Viewing ${report.type_display} report`
                                    );
                                  }}
                                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

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
                      refetchAnalytics();
                      refetchMetrics();
                      toast.success("Data refreshed successfully");
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
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
        {(analyticsLoading || generating) && (
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
                    ? "Your report is being generated. This may take a moment..."
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
