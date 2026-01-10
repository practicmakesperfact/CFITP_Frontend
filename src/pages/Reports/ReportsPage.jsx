import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Shield,
  Loader2,
  Sparkles,
  Database,
  Target,
  Award,
  MessageSquare,
  FileSpreadsheet,
  FilterX,
  X,
  Check,
  User,
  BarChart,
  PieChart,
  Eye,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../api/reportsApi.js";
import { format, subDays, parseISO } from "date-fns";
import ChartCard from "../../components/Dashboard/ChartCard.jsx";
import { useUIStore } from "../../app/store/uiStore.js";
import { saveAs } from "file-saver";

// Lazy load heavy components
const ApexChart = React.lazy(() => import("react-apexcharts"));

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const setLoading = useUIStore((state) => state.setLoading);
  const [darkMode] = useState(false);

  // State management
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportId, setReportId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    priority: [],
    status: [],
    slaOnly: false,
  });

  // Refs
  const headerRef = useRef(null);

  // Date presets
  const datePresets = [
    {
      label: "Today",
      value: "today",
      getDates: () => {
        const today = new Date();
        return {
          start: format(today, "yyyy-MM-dd"),
          end: format(today, "yyyy-MM-dd"),
        };
      },
    },
    {
      label: "Yesterday",
      value: "yesterday",
      getDates: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          start: format(yesterday, "yyyy-MM-dd"),
          end: format(yesterday, "yyyy-MM-dd"),
        };
      },
    },
    {
      label: "Last 7 Days",
      value: "week",
      getDates: () => {
        return {
          start: format(subDays(new Date(), 7), "yyyy-MM-dd"),
          end: format(new Date(), "yyyy-MM-dd"),
        };
      },
    },
    {
      label: "Last 30 Days",
      value: "month",
      getDates: () => {
        return {
          start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
          end: format(new Date(), "yyyy-MM-dd"),
        };
      },
    },
    {
      label: "Custom",
      value: "custom",
      getDates: () => ({ start: startDate, end: endDate }),
    },
  ];

  // Priority options
  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    {
      value: "medium",
      label: "Medium",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
  ];

  // Status options
  const statusOptions = [
    { value: "open", label: "Open", color: "bg-blue-100 text-blue-800" },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "resolved",
      label: "Resolved",
      color: "bg-green-100 text-green-800",
    },
    { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
  ];

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
    error: analyticsError,
    isFetching: analyticsFetching,
  } = useQuery({
    queryKey: ["analytics", dateRange, startDate, endDate, filters],
    queryFn: async () => {
      setLoading(true);
      try {
        const params = {
          start_date: startDate,
          end_date: endDate,
          ...(filters.priority.length > 0 && {
            priority: filters.priority.join(","),
          }),
          ...(filters.status.length > 0 && {
            status: filters.status.join(","),
          }),
          ...(filters.slaOnly && { sla_only: true }),
        };

        console.log("📡 Fetching analytics with params:", params);
        const response = await reportsApi.getAnalyticsData(params);
        console.log("📡 Analytics API Response:", response);

        // Handle nested data structure
        if (response.data && response.data.data) {
          return response.data.data;
        }
        return response.data || {};
      } catch (err) {
        console.error("❌ Error fetching analytics:", err);
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load analytics data"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
    retry: 2,
  });

  // Fetch generated reports
  const {
    data: reportsList,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["generated-reports"],
    queryFn: async () => {
      const response = await reportsApi.getReports();
      return response.data?.results || response.data || [];
    },
    enabled: true,
  });

  // Create report mutation for PDF generation
  const createReportMutation = useMutation({
    mutationFn: (reportData) => reportsApi.createReport(reportData),
    onMutate: () => {
      setGenerating(true);
      toast.loading("Generating PDF report...", {
        id: "report-generation",
        duration: Infinity,
      });
    },
    onSuccess: (response) => {
      const report = response.data;
      setReportId(report.id);
      toast.success("PDF generation started!", {
        id: "report-generation",
      });
      pollReportStatus(report.id);
      setTimeout(() => refetchReports(), 2000);
    },
    onError: (error) => {
      setGenerating(false);
      console.error("PDF generation error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "Failed to generate PDF";
      toast.error(`Failed to generate PDF: ${errorMessage}`, {
        id: "report-generation",
      });
    },
  });

  // Poll for report status
  const pollReportStatus = useCallback(
    async (id) => {
      try {
        const response = await reportsApi.getReportStatus(id);
        const report = response.data?.data || response.data;

        if (report?.status === "generated" && report.result_available) {
          setGenerating(false);
          toast.success("PDF Report Ready!", {
            id: "report-generation",
            duration: 5000,
            action: {
              label: "Download",
              onClick: () => handleDownloadReportById(id),
            },
          });
          setReportId(null);
          refetchReports();
        } else if (report?.status === "failed") {
          setGenerating(false);
          toast.error("PDF generation failed. Please try again.", {
            id: "report-generation",
          });
          setReportId(null);
        } else if (report?.status === "processing") {
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
  const handleDatePreset = (presetValue) => {
    const preset = datePresets.find((p) => p.value === presetValue);
    if (preset) {
      setDateRange(presetValue);
      const dates = preset.getDates();
      setStartDate(dates.start);
      setEndDate(dates.end);
      toast.success(`Date range set to ${preset.label}`, {
        icon: <Calendar className="w-4 h-4" />,
      });
    }
  };

  // Filter handling
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (filterType === "slaOnly") {
        return { ...prev, [filterType]: value };
      }

      if (prev[filterType].includes(value)) {
        return {
          ...prev,
          [filterType]: prev[filterType].filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [filterType]: [...prev[filterType], value],
        };
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priority: [],
      status: [],
      slaOnly: false,
    });
    toast.success("All filters cleared", {
      icon: <FilterX className="w-4 h-4" />,
    });
  };

  // Apply filters
  const applyFilters = () => {
    refetchAnalytics();
    toast.success("Filters applied successfully", {
      icon: <Check className="w-4 h-4" />,
    });
  };

  // Generate PDF report
  const generatePDFReport = () => {
    const reportData = {
      type: "performance_dashboard",
      format: "pdf",
      parameters: {
        start_date: startDate,
        end_date: endDate,
        date_range: dateRange,
        ...filters,
      },
    };

    createReportMutation.mutate(reportData);
  };

  // CSV export only
  const handleCSVExport = async () => {
    try {
      toast.loading("Preparing CSV export...", { id: "csv-export" });

      const params = {
        start_date: startDate,
        end_date: endDate,
        export_format: "csv",
        ...filters,
      };

      const response = await reportsApi.exportQuick("csv", params);

      if (response.data) {
        const blob = new Blob([response.data], { type: "text/csv" });
        const filename = `CFITP_Dashboard_${format(
          new Date(),
          "yyyy-MM-dd_HH-mm"
        )}.csv`;
        saveAs(blob, filename);
        toast.success("CSV exported successfully!", { id: "csv-export" });
      }
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV. Please try again.", {
        id: "csv-export",
      });
    }
  };

  // Download report by ID
  const handleDownloadReportById = async (reportId) => {
    try {
      toast.loading("Downloading report...", { id: "download-report" });

      const response = await reportsApi.downloadReport(reportId);

      const contentDisposition = response.headers["content-disposition"];
      let filename = `CFITP_Report_${format(
        new Date(),
        "yyyy-MM-dd_HH-mm"
      )}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });

      saveAs(blob, filename);
      toast.success("Report downloaded successfully!", {
        id: "download-report",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report. Please try again.", {
        id: "download-report",
      });
    }
  };

  // Prepare chart data with proper structure
  const prepareChartData = () => {
    if (!analyticsData || analyticsLoading) {
      console.log("⏳ No analytics data yet or still loading");
      return null;
    }

    console.log("🔍 Preparing chart data from analytics:", analyticsData);

    // Extract data with fallbacks
    const issuesByStatus = analyticsData.issues_by_status || [];
    const issuesByPriority = analyticsData.issues_by_priority || [];
    const teamPerformance = analyticsData.team_performance || [];

    // Debug: Check data structure
    console.log("📊 Raw data check:", {
      issuesByStatus,
      issuesByPriority,
      teamPerformance,
      hasIssuesByStatus: issuesByStatus.length > 0,
      hasIssuesByPriority: issuesByPriority.length > 0,
      hasTeamPerformance: teamPerformance.length > 0,
    });

    // 1. Issues by Status - Pie Chart (REMOVED - We'll use direct ApexChart now)
    // Keeping the data preparation for other charts
    const statusData = {
      series: [],
      labels: [],
      colors: ["#3B82F6", "#8B5CF6", "#10B981", "#6B7280"],
    };

    if (issuesByStatus.length > 0) {
      // Sort in logical order: Open → In Progress → Resolved → Closed
      const statusOrder = ["open", "in_progress", "resolved", "closed"];
      const sortedStatus = [...issuesByStatus].sort((a, b) => {
        const aIndex = statusOrder.indexOf(a.status);
        const bIndex = statusOrder.indexOf(b.status);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      sortedStatus.forEach((item) => {
        statusData.series.push(item.count || 0);
        statusData.labels.push(
          item.status_display ||
            item.status
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
        );
      });
    } else {
      // Fallback demo data
      statusData.series = [13, 6, 5, 3];
      statusData.labels = ["Open", "In Progress", "Resolved", "Closed"];
    }

    // 2. Issues by Priority - Bar Chart
    const priorityData = {
      series: [],
      labels: ["Critical", "High", "Medium", "Low"],
      colors: ["#EF4444", "#F97316", "#F59E0B", "#10B981"],
    };

    if (issuesByPriority.length > 0) {
      // Create a map for priority counts
      const priorityMap = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      issuesByPriority.forEach((item) => {
        const priority = item.priority?.toLowerCase();
        if (priority && priority in priorityMap) {
          priorityMap[priority] = item.count || 0;
        }
      });

      // Add in correct order
      priorityData.series = [
        priorityMap.critical,
        priorityMap.high,
        priorityMap.medium,
        priorityMap.low,
      ];
    } else {
      // Fallback demo data
      priorityData.series = [1, 6, 9, 11];
    }

    // 3. Team Performance - Grouped Bar Chart
    const teamData = {
      series: [
        { name: "Resolved", data: [] },
        { name: "Pending", data: [] },
      ],
      categories: [],
      colors: ["#10B981", "#FB923C"],
    };

    if (teamPerformance.length > 0) {
      teamPerformance.forEach((member) => {
        teamData.categories.push(
          member.name || member.email?.split("@")[0] || "Unknown"
        );
        teamData.series[0].data.push(member.resolved || 0);
        teamData.series[1].data.push(member.pending || 0);
      });
    } else {
      // Fallback demo data
      teamData.categories = ["John Doe", "Jane Smith", "Bob Johnson"];
      teamData.series[0].data = [8, 12, 6];
      teamData.series[1].data = [2, 3, 1];
    }

    // 4. Resolution Trend - Area Chart (using fallback data)
    const trendData = {
      series: [
        { name: "Issues Created", data: [5, 8, 6, 10, 7, 9] },
        { name: "Issues Resolved", data: [4, 6, 5, 8, 6, 8] },
      ],
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      colors: ["#0EA5A4", "#10B981"],
    };

    const chartData = {
      // REMOVED: issuesByStatus from here - we'll render it directly
      issuesByPriority: {
        type: "bar",
        data: priorityData,
      },
      teamPerformance: {
        type: "bar",
        data: teamData,
      },
      resolutionTrend: {
        type: "area",
        data: trendData,
      },
    };

    console.log("✅ Prepared chart data:", chartData);
    return chartData;
  };

  // Get metric value with fallback
  const getMetricValue = (metricName) => {
    if (!analyticsData?.summary) {
      return { formatted: "0", raw: 0 };
    }

    const rawValue = analyticsData.summary[metricName];
    if (rawValue === null || rawValue === undefined || rawValue === "N/A") {
      return { formatted: "N/A", raw: 0 };
    }

    return { formatted: rawValue, raw: rawValue };
  };

  // KPI metrics
  const kpiMetrics = [
    {
      id: "total_issues",
      title: "Total Issues",
      value: getMetricValue("total_issues").formatted,
      description: "Issues reported in period",
      icon: <AlertCircle size={20} />,
      color: "teal",
    },
    {
      id: "resolved_issues",
      title: "Resolved Issues",
      value: getMetricValue("resolved_issues").formatted,
      description: "Successfully resolved",
      icon: <CheckCircle size={20} />,
      color: "green",
    },
    {
      id: "team_efficiency",
      title: "Team Efficiency",
      value: getMetricValue("team_efficiency").formatted,
      description: "Overall team performance",
      icon: <Award size={20} />,
      color: "orange",
    },
    {
      id: "avg_resolution_time",
      title: "Avg. Resolution",
      value: getMetricValue("avg_resolution_time").formatted,
      description: "Average time to resolve",
      icon: <Clock size={20} />,
      color: "blue",
    },
    {
      id: "first_response_time",
      title: "First Response",
      value: getMetricValue("first_response_time").formatted,
      description: "Average first response time",
      icon: <MessageSquare size={20} />,
      color: "indigo",
    },
    {
      id: "sla_compliance",
      title: "SLA Compliance",
      value: getMetricValue("sla_compliance").formatted,
      description: "Service level compliance",
      icon: <Target size={20} />,
      color: "purple",
    },
    {
      id: "reopen_rate",
      title: "Reopen Rate",
      value: getMetricValue("reopen_rate").formatted,
      description: "Percentage of reopened issues",
      icon: <RefreshCw size={20} />,
      color: "red",
    },
  ];

  // Team performance table data - Use actual data
  const teamPerformanceData = analyticsData?.team_performance || [];

  // View team member details with enhanced modal
  const viewTeamMemberDetails = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  // Generate member report
  const generateMemberReport = (member) => {
    const reportData = {
      type: "team_member_performance",
      format: "pdf",
      parameters: {
        start_date: startDate,
        end_date: endDate,
        user_id: member.id,
        member_name: member.name,
        ...filters,
      },
    };

    createReportMutation.mutate(reportData);
    setShowMemberModal(false);
    toast.success(`Generating report for ${member.name}...`);
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        refetchAnalytics();
        toast.success("Data refreshed automatically");
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refetchAnalytics]);

  // Load generated reports
  useEffect(() => {
    if (reportsList) {
      setGeneratedReports(
        Array.isArray(reportsList) ? reportsList : [reportsList]
      );
    }
  }, [reportsList]);

  // Poll active report
  useEffect(() => {
    if (reportId) {
      pollReportStatus(reportId);
    }
  }, [reportId, pollReportStatus]);

  // Prepare chart data
  const chartData = prepareChartData();

  const periodDisplay =
    analyticsData?.period_display ||
    `${format(parseISO(startDate), "MMM dd, yyyy")} - ${format(
      parseISO(endDate),
      "MMM dd, yyyy"
    )}`;

  // Show loading state if chart data is not ready
  if (analyticsLoading || !chartData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-slate-50 via-white to-teal-50/30"
      }`}
    >
      {/* Header */}
      <motion.div
        ref={headerRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-50 ${
          darkMode
            ? "bg-gray-800/90 border-gray-700"
            : "bg-white/80 border-gray-200"
        } border-b backdrop-blur-sm transition-all duration-300`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-teal-700 to-blue-600 bg-clip-text text-transparent"
              >
                Advanced Analytics & Reports
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`mt-1 flex items-center gap-2 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>Comprehensive insights with advanced filtering</span>
                <span className="text-teal-600 font-medium">
                  {periodDisplay}
                </span>
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  showFilters
                    ? "bg-teal-600 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleCSVExport}
                  disabled={!analyticsData || analyticsLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV
                </button>

                <button
                  onClick={generatePDFReport}
                  disabled={generating || !analyticsData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Generate PDF
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Error State */}
        {analyticsError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 dark:text-red-300">
                    Failed to Load Analytics
                  </h3>
                  <p className="text-red-700 dark:text-red-400 mt-1">
                    {analyticsError.response?.data?.detail ||
                      analyticsError.response?.data?.error ||
                      analyticsError.message}
                  </p>
                  <button
                    onClick={() => refetchAnalytics()}
                    className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-8 rounded-2xl ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              } border shadow-sm overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Advanced Filters
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Fine-tune your report with detailed filters
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FilterX className="w-4 h-4" />
                      Clear All
                    </button>
                    <button
                      onClick={() => {
                        applyFilters();
                        setShowFilters(false);
                      }}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Priority Filter */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Priority Level
                    </label>
                    <div className="space-y-2">
                      {priorityOptions.map((priority) => (
                        <label
                          key={priority.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            darkMode
                              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={filters.priority.includes(priority.value)}
                            onChange={() =>
                              handleFilterChange("priority", priority.value)
                            }
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className={`font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Issue Status
                    </label>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <label
                          key={status.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            darkMode
                              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status.value)}
                            onChange={() =>
                              handleFilterChange("status", status.value)
                            }
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className={`font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range & Options */}
                  <div className="space-y-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-3 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Date Range
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {datePresets.map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => handleDatePreset(preset.value)}
                            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                              dateRange === preset.value
                                ? "bg-teal-600 border-teal-600 text-white"
                                : darkMode
                                ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      {dateRange === "custom" && (
                        <div className="space-y-2 mt-3">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              darkMode
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                            max={endDate}
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              darkMode
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                            min={startDate}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Content */}
        {analyticsData && chartData && (
          <div className="space-y-8">
            {/* KPI Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Key Performance Indicators
                  </h2>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    Real-time metrics and performance insights
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Live Data
                    </span>
                  </div>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      autoRefresh
                        ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                    />
                    Auto-refresh
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-2xl border p-6 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700"
                        : "bg-white border-gray-200"
                    } shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl ${
                          darkMode
                            ? `bg-${metric.color}-900/30`
                            : `bg-${metric.color}-100`
                        }`}
                      >
                        <div
                          className={
                            darkMode
                              ? `text-${metric.color}-400`
                              : `text-${metric.color}-600`
                          }
                        >
                          {metric.icon}
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div
                        className={`text-3xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {metric.value}
                      </div>
                      <div
                        className={`font-medium mt-1 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {metric.title}
                      </div>
                    </div>
                    <div
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
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
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Visual Analytics
                  </h2>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    Interactive charts with drill-down capability
                  </p>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues by Status - PIE CHART (FIXED - LIKE CLIENT DASHBOARD) */}
                <div
                  className={`rounded-2xl border ${
                    darkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-purple-900/30" : "bg-purple-100"
                          }`}
                        >
                          <PieChart
                            className={`w-5 h-5 ${
                              darkMode ? "text-purple-400" : "text-purple-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Issues by Status
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Distribution across different statuses
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: {analyticsData?.summary?.total_issues || 0}
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <React.Suspense
                        fallback={
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                        }
                      >
                        {/* DIRECT APEXCHART USING REAL DATABASE DATA */}
                        <ApexChart
                          options={{
                            chart: {
                              type: "pie",
                              height: 300,
                              toolbar: { show: false },
                            },
                            labels: [
                              "Open",
                              "In Progress",
                              "Resolved",
                              "Closed",
                            ],
                            colors: [
                              "#ef4444",
                              "#f59e0b",
                              "#3b82f6",
                              "#10b981",
                            ],
                            legend: {
                              position: "bottom",
                              fontSize: "14px",
                              fontFamily: "inherit",
                              fontWeight: 500,
                            },
                            dataLabels: {
                              enabled: false,
                            },
                            plotOptions: {
                              pie: {
                                donut: {
                                  size: "70%",
                                  labels: {
                                    show: true,
                                    total: {
                                      show: true,
                                      label: "Total Issues",
                                      fontSize: "22px",
                                      fontWeight: 600,
                                      color: darkMode ? "#D1D5DB" : "#374151",
                                      formatter: () =>
                                        (
                                          analyticsData?.summary
                                            ?.total_issues || 0
                                        ).toString(),
                                    },
                                    value: {
                                      show: true,
                                      fontSize: "28px",
                                      fontWeight: 700,
                                      color: darkMode ? "#F9FAFB" : "#111827",
                                      formatter: (val) =>
                                        Math.round(val).toString(),
                                    },
                                  },
                                },
                              },
                            },
                            tooltip: {
                              y: {
                                formatter: (value) =>
                                  value + " issue" + (value !== 1 ? "s" : ""),
                              },
                              theme: darkMode ? "dark" : "light",
                            },
                          }}
                          series={[
                            analyticsData?.summary?.open_issues || 0,
                            analyticsData?.summary?.in_progress_issues || 0,
                            analyticsData?.summary?.resolved_issues || 0,
                            analyticsData?.summary?.closed_issues || 0,
                          ]}
                          type="pie"
                          height={300}
                          width="100%"
                        />
                      </React.Suspense>
                    </div>
                  </div>
                </div>

                {/* Issues by Priority - BAR CHART */}
                <div
                  className={`rounded-2xl border ${
                    darkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-orange-900/30" : "bg-orange-100"
                          }`}
                        >
                          <BarChart
                            className={`w-5 h-5 ${
                              darkMode ? "text-orange-400" : "text-orange-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Issues by Priority
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Distribution across priority levels
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <React.Suspense
                        fallback={
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                        }
                      >
                        <ChartCard
                          title=""
                          type="bar"
                          data={chartData.issuesByPriority.data}
                          isLoading={analyticsLoading}
                          height={300}
                          showHeader={false}
                          darkMode={darkMode}
                        />
                      </React.Suspense>
                    </div>
                  </div>
                </div>

                {/* Team Performance - GROUPED BAR CHART */}
                <div
                  className={`rounded-2xl border ${
                    darkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-blue-900/30" : "bg-blue-100"
                          }`}
                        >
                          <Users
                            className={`w-5 h-5 ${
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Team Performance
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Resolved vs. Pending issues by staff
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <React.Suspense
                        fallback={
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                        }
                      >
                        <ChartCard
                          title=""
                          type="bar"
                          data={chartData.teamPerformance.data}
                          isLoading={analyticsLoading}
                          height={300}
                          showHeader={false}
                          darkMode={darkMode}
                        />
                      </React.Suspense>
                    </div>
                  </div>
                </div>

                {/* Resolution Trends - AREA CHART */}
                <div
                  className={`rounded-2xl border ${
                    darkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  } shadow-sm overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-green-900/30" : "bg-green-100"
                          }`}
                        >
                          <TrendingUpIcon
                            className={`w-5 h-5 ${
                              darkMode ? "text-green-400" : "text-green-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Resolution Trends
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Issues created vs. resolved over time
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <React.Suspense
                        fallback={
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                        }
                      >
                        <ChartCard
                          title=""
                          type="area"
                          data={chartData.resolutionTrend.data}
                          isLoading={analyticsLoading}
                          height={300}
                          showHeader={false}
                          darkMode={darkMode}
                        />
                      </React.Suspense>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Team Performance Table */}
            {teamPerformanceData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                } shadow-sm overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3
                        className={`text-xl font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Team Performance Details
                      </h3>
                      <p
                        className={`mt-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Individual performance metrics with detailed insights
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCSVExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Team Report
                      </button>
                      <button
                        onClick={generatePDFReport}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Export All as PDF
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          className={`border-b ${
                            darkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Team Member
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Assigned
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Resolved
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pending
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Efficiency
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Avg. Resolution
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamPerformanceData.map((member, index) => (
                          <tr
                            key={member.id || index}
                            className={`border-b ${
                              darkMode
                                ? "border-gray-700 hover:bg-gray-800/50"
                                : "border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    darkMode ? "bg-gray-700" : "bg-gray-100"
                                  }`}
                                >
                                  <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                  <div
                                    className={`font-medium ${
                                      darkMode ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {member.name || member.email}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  member.role === "manager"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                }`}
                              >
                                {member.role_display || member.role}
                              </span>
                            </td>
                            <td
                              className={`py-3 px-4 font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {member.total_assigned || 0}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {member.resolved || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                  {member.pending || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-teal-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        member.efficiency || 0,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span
                                  className={`text-sm font-medium min-w-[40px] text-right ${
                                    (member.efficiency || 0) >= 80
                                      ? "text-green-600 dark:text-green-400"
                                      : (member.efficiency || 0) >= 60
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {member.efficiency
                                    ? `${member.efficiency}%`
                                    : "0%"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {member.avg_resolution_time_hours
                                  ? `${member.avg_resolution_time_hours}h`
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => viewTeamMemberDetails(member)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  Details
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
          </div>
        )}
      </div>

      {/* Team Member Details Modal */}
      <AnimatePresence>
        {showMemberModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl p-6 max-w-2xl w-full ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                    <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedMember.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedMember.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Assigned
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {selectedMember.total_assigned || 0}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Resolved
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {selectedMember.resolved || 0}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pending
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {selectedMember.pending || 0}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Efficiency
                  </div>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2">
                    {selectedMember.efficiency || 0}%
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4
                  className={`font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Performance Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Role
                    </span>
                    <span className="font-medium">
                      {selectedMember.role_display || selectedMember.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Resolution Rate
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {selectedMember.total_assigned > 0
                        ? `${Math.round(
                            (selectedMember.resolved /
                              selectedMember.total_assigned) *
                              100
                          )}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Avg. Resolution Time
                    </span>
                    <span className="font-medium">
                      {selectedMember.avg_resolution_time_hours || "N/A"} hours
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => generateMemberReport(selectedMember)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Generate Performance Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
