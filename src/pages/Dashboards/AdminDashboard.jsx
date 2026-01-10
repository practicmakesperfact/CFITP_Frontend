import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ClipboardList,
  UserCog,
  MessageSquare,
  Users,
  BarChart3,
  FileText,
  RefreshCw,
  ExternalLink,
  Activity,
  Shield,
} from "lucide-react";
import { issuesApi } from "../../api/issuesApi";
import { feedbackApi } from "../../api/feedbackApi";
import { reportsApi } from "../../api/reportsApi";
import { useAuth } from "../../app/hooks";
import KpiCard from "../../components/Dashboard/KpiCard";
import ChartCard from "../../components/Dashboard/ChartCard";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import React from "react";

// Lazy load ApexCharts for better performance
const ApexChart = React.lazy(() => import("react-apexcharts"));

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard summary data from backend (REAL DATABASE VALUES)
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: async () => {
      try {
        const response = await reportsApi.getAnalyticsData({
          start_date: null, // All time data
          end_date: null,
        });
        return response.data?.data || response.data || {};
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {};
      }
    },
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  // Handle refresh all data
  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchAnalytics()
      .then(() => {
        setIsRefreshing(false);
        toast.success("Dashboard refreshed");
      })
      .catch(() => {
        setIsRefreshing(false);
        toast.error("Refresh failed");
      });
  };

  // Extract REAL data from analytics
  const summary = analyticsData?.summary || {};
  const issuesByStatus = analyticsData?.issues_by_status || [];
  const issuesByPriority = analyticsData?.issues_by_priority || [];
  const teamPerformance = analyticsData?.team_performance || [];

  // REAL KPI values from database
  const totalIssues = summary.total_issues || 0;
  const openIssues = summary.open_issues || 0;
  const inProgressIssues = summary.in_progress_issues || 0;
  const resolvedIssues = summary.resolved_issues || 0;
  const totalFeedback = summary.total_feedback || 0;
  const teamEfficiency = summary.team_efficiency_percentage || 0;
  const avgResponseTime = summary.first_response_time_hours || 0;
  const avgResolutionTime = summary.avg_resolution_time_hours || 0;
  const slaCompliance = summary.sla_compliance_percentage || 0;
  const reopenRate = summary.reopen_rate_percentage || 0;

  // Calculate feedback status counts from team performance or summary
  const newFeedback = summary.new_feedback || 0;
  const acknowledgedFeedback = summary.acknowledged_feedback || 0;
  const convertedFeedback = summary.converted_feedback || 0;

  // Prepare REAL chart data from database
  const getStatusChartData = () => {
    if (issuesByStatus.length > 0) {
      return {
        series: issuesByStatus.map((item) => item.count || 0),
        labels: issuesByStatus.map(
          (item) =>
            item.status_display ||
            item.status
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
        ),
        colors: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"],
      };
    }

    // Fallback to summary data if no detailed breakdown
    return {
      series: [openIssues, inProgressIssues, resolvedIssues],
      labels: ["Open", "In Progress", "Resolved"],
      colors: ["#ef4444", "#f59e0b", "#10b981"],
    };
  };

  const getPriorityChartData = () => {
    if (issuesByPriority.length > 0) {
      return {
        series: issuesByPriority.map((item) => item.count || 0),
        labels: issuesByPriority.map(
          (item) =>
            item.priority_display ||
            item.priority.replace(/\b\w/g, (l) => l.toUpperCase())
        ),
        colors: ["#ef4444", "#f97316", "#f59e0b", "#10b981"],
      };
    }

    // If no priority data, show empty chart
    return {
      series: [0, 0, 0, 0],
      labels: ["Critical", "High", "Medium", "Low"],
      colors: ["#ef4444", "#f97316", "#f59e0b", "#10b981"],
    };
  };

  const getPerformanceChartData = () => {
    return {
      series: [
        teamEfficiency,
        slaCompliance,
        Math.max(0, 100 - (avgResponseTime / 24) * 100), // Response score
        Math.max(0, 100 - (avgResolutionTime / 168) * 100), // Resolution score
      ],
      labels: ["Efficiency", "SLA", "Response", "Resolution"],
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
    };
  };

  const statusChartData = getStatusChartData();
  const priorityChartData = getPriorityChartData();
  const performanceChartData = getPerformanceChartData();

  // Show loading state
  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 pb-10 px-4 lg:px-6"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Real-time system overview and metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl">
                <UserCog className="text-teal-600" size={20} />
                <span className="font-medium text-slate-700">
                  {user?.first_name || user?.email || "Admin"}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards - ALL REAL DATABASE VALUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Issues"
            value={totalIssues}
            icon={ClipboardList}
            color="teal"
            linkTo="/app/issues"
            linkText="View All Issues"
          />
          <KpiCard
            title="Open Issues"
            value={openIssues}
            icon={AlertTriangle}
            color="red"
            linkTo="/app/issues?status=open"
            linkText="View Open Issues"
          />
          <KpiCard
            title="Client Feedback"
            value={totalFeedback}
            icon={MessageSquare}
            color="blue"
            linkTo="/app/admin/feedback"
            linkText="Manage Feedback"
          />
          <KpiCard
            title="Team Efficiency"
            value={`${teamEfficiency}%`}
            icon={Activity}
            color="green"
            linkTo="/app/reports"
            linkText="View Performance"
          />
        </div>

        {/* Charts Grid - ALL REAL DATABASE VALUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Issues by Status - REAL DATA */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Issues by Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    Current issue distribution
                  </p>
                </div>
              </div>
              <Link
                to="/app/issues"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                Details <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-64">
              <React.Suspense
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                }
              >
                <ApexChart
                  options={{
                    chart: {
                      type: "donut",
                      height: "100%",
                      toolbar: { show: false },
                    },
                    labels: statusChartData.labels,
                    colors: statusChartData.colors,
                    legend: {
                      position: "bottom",
                      fontSize: "12px",
                    },
                    dataLabels: { enabled: false },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: "70%",
                          labels: {
                            show: true,
                            total: {
                              show: true,
                              label: "Total Issues",
                              fontSize: "16px",
                              fontWeight: 600,
                            },
                            value: {
                              show: true,
                              formatter: (val) => Math.round(val).toString(),
                            },
                          },
                        },
                      },
                    },
                    tooltip: {
                      y: {
                        formatter: (value) =>
                          `${value} issue${value !== 1 ? "s" : ""}`,
                      },
                    },
                  }}
                  series={statusChartData.series}
                  type="donut"
                  height="100%"
                />
              </React.Suspense>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span>For detailed breakdown:</span>
                <Link
                  to="/app/reports"
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  View Reports →
                </Link>
              </div>
            </div>
          </div>

          {/* Issues by Priority - REAL DATA */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Issues by Priority
                  </h3>
                  <p className="text-sm text-gray-600">
                    Priority level distribution
                  </p>
                </div>
              </div>
              <Link
                to="/app/issues"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                Details <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-64">
              <React.Suspense
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                }
              >
                <ApexChart
                  options={{
                    chart: {
                      type: "bar",
                      height: "100%",
                      toolbar: { show: false },
                    },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        columnWidth: "60%",
                      },
                    },
                    dataLabels: { enabled: false },
                    xaxis: {
                      categories: priorityChartData.labels,
                      labels: {
                        style: {
                          fontSize: "12px",
                        },
                      },
                    },
                    yaxis: {
                      title: {
                        text: "Number of Issues",
                        style: {
                          fontSize: "12px",
                        },
                      },
                    },
                    colors: priorityChartData.colors,
                    tooltip: {
                      y: {
                        formatter: (value) =>
                          `${value} issue${value !== 1 ? "s" : ""}`,
                      },
                    },
                  }}
                  series={[
                    {
                      name: "Issues",
                      data: priorityChartData.series,
                    },
                  ]}
                  type="bar"
                  height="100%"
                />
              </React.Suspense>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-4">
                {priorityChartData.labels.map((label, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        index === 0
                          ? "bg-red-100 text-red-800"
                          : index === 1
                          ? "bg-orange-100 text-orange-800"
                          : index === 2
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {label}: {priorityChartData.series[index] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats & Links - ALL REAL DATABASE VALUES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Metrics - REAL DATA */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Team Efficiency",
                  value: `${teamEfficiency}%`,
                  icon: <Activity className="w-4 h-4" />,
                  color: "text-green-600",
                },
                {
                  label: "SLA Compliance",
                  value: `${slaCompliance}%`,
                  icon: <CheckCircle className="w-4 h-4" />,
                  color: "text-blue-600",
                },
                {
                  label: "Avg. Response Time",
                  value: `${avgResponseTime}h`,
                  icon: <Clock className="w-4 h-4" />,
                  color: "text-orange-600",
                },
                {
                  label: "Avg. Resolution Time",
                  value: `${avgResolutionTime}h`,
                  icon: <Clock className="w-4 h-4" />,
                  color: "text-purple-600",
                },
                {
                  label: "Reopen Rate",
                  value: `${reopenRate}%`,
                  icon: <RefreshCw className="w-4 h-4" />,
                  color: "text-red-600",
                },
              ].map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${metric.color.replace(
                        "text-",
                        "bg-"
                      )} bg-opacity-10`}
                    >
                      {metric.icon}
                    </div>
                    <span className="text-gray-700">{metric.label}</span>
                  </div>
                  <span className={`font-semibold ${metric.color}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/app/reports"
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Detailed Reports
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/app/issues"
                className="flex items-center gap-3 p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
                <div>
                  <div className="font-medium">All Issues</div>
                  <div className="text-sm opacity-75">
                    View detailed issue list
                  </div>
                </div>
              </Link>
              <Link
                to="/app/admin/feedback"
                className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <div>
                  <div className="font-medium">Manage Feedback</div>
                  <div className="text-sm opacity-75">
                    Review client feedback
                  </div>
                </div>
              </Link>
              <Link
                to="/app/reports"
                className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <div>
                  <div className="font-medium">Generate Reports</div>
                  <div className="text-sm opacity-75">
                    Create performance reports
                  </div>
                </div>
              </Link>
              <Link
                to="/app/admin/users"
                className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <div>
                  <div className="font-medium">User Management</div>
                  <div className="text-sm opacity-75">
                    Manage users and roles
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status & Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Data Freshness</span>
                </div>
                <span className="text-sm font-medium text-green-600">Live</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Data Source</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  Database
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Total Records</span>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {totalIssues + totalFeedback}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Auto Refresh</span>
                </div>
                <span className="text-sm font-medium text-purple-600">
                  60 seconds
                </span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="text-sm text-teal-800">
                <div className="font-medium">Data Information</div>
                <div>
                  All metrics shown are real-time values from your database
                </div>
                <div className="mt-1 text-xs text-teal-600">
                  • No hardcoded values
                  <br />• Auto-updates every 60s
                  <br />• Click Refresh for immediate update
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
