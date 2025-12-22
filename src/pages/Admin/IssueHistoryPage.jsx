// src/pages/Admin/IssueHistoryPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Download,
  Eye,
  ExternalLink,
  ArrowLeft,
  Info,
} from "lucide-react";
import { formatDistanceToNow, format, subDays } from "date-fns";
import * as XLSX from "xlsx";
import { issueHistoryApi } from "../../api/issueHistoryApi";
import { issuesApi } from "../../api/issuesApi";
import { useAuth } from "../../app/hooks";
import toast from "react-hot-toast";

export default function IssueHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch data with pagination
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch issue history with pagination
      const params = {
        page: currentPage,
        page_size: pageSize,
      };

      const historyResponse = await issueHistoryApi.listAll(params);
      const historyData = historyResponse.results || historyResponse || [];
      setHistory(historyData);

      // Set pagination info
      setTotalCount(historyResponse.count || historyData.length);
      setTotalPages(
        Math.ceil((historyResponse.count || historyData.length) / pageSize)
      );

      // Fetch issues for dropdown
      const issuesResponse = await issuesApi.listAll();
      const issuesData = issuesResponse.results || issuesResponse || [];
      setIssues(issuesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load issue history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user, currentPage, pageSize]);

  // Extract unique users and statuses for filters
  const users = [
    ...new Set(history.map((item) => item.changed_by?.email).filter(Boolean)),
  ];
  const statuses = [
    ...new Set(history.map((item) => item.new_status).filter(Boolean)),
  ];

  // Filter history
  const filteredHistory = history.filter((item) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      item.issue?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.changed_by?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || item.new_status === statusFilter;

    // Date filter
    const matchesDate = () => {
      if (dateFilter === "all") return true;

      const itemDate = new Date(item.timestamp);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return itemDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = subDays(today, 7);
          return itemDate >= weekAgo;
        case "month":
          const monthAgo = subDays(today, 30);
          return itemDate >= monthAgo;
        default:
          return true;
      }
    };

    // Issue filter
    const matchesIssue =
      selectedIssue === "all" || item.issue?.id === selectedIssue;

    // User filter
    const matchesUser =
      selectedUser === "all" || item.changed_by?.email === selectedUser;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDate() &&
      matchesIssue &&
      matchesUser
    );
  });

  // Calculate stats
  const stats = {
    total: totalCount,
    today: history.filter(
      (item) =>
        new Date(item.timestamp).toDateString() === new Date().toDateString()
    ).length,
    week: history.filter(
      (item) => new Date(item.timestamp) >= subDays(new Date(), 7)
    ).length,
    uniqueIssues: [
      ...new Set(history.map((item) => item.issue?.id).filter(Boolean)),
    ].length,
    uniqueUsers: [
      ...new Set(history.map((item) => item.changed_by?.email).filter(Boolean)),
    ].length,
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const exportData = filteredHistory.map((item) => ({
        Timestamp: item.timestamp
          ? format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss")
          : "N/A",
        "Issue ID": item.issue?.id ? item.issue.id.substring(0, 8) : "N/A",
        "Issue Title": item.issue?.title || "N/A",
        "Changed By Email": item.changed_by?.email || "System",
        "Changed By Name":
          item.changed_by?.first_name && item.changed_by?.last_name
            ? `${item.changed_by.first_name} ${item.changed_by.last_name}`
            : item.changed_by?.email || "System",
        "Changed By Role": item.changed_by?.role || "N/A",
        "Old Status": item.old_status?.toUpperCase() || "N/A",
        "New Status": item.new_status?.toUpperCase() || "N/A",
        "Time Since": item.timestamp
          ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const maxWidth = exportData.reduce(
        (w, r) => Math.max(w, r["Issue Title"].length),
        10
      );
      worksheet["!cols"] = [
        { wch: 20 }, // Timestamp
        { wch: 10 }, // Issue ID
        { wch: Math.min(maxWidth, 50) }, // Issue Title
        { wch: 25 }, // Changed By Email
        { wch: 20 }, // Changed By Name
        { wch: 12 }, // Changed By Role
        { wch: 12 }, // Old Status
        { wch: 12 }, // New Status
        { wch: 20 }, // Time Since
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Issue History");

      const fileName = `issue_history_${format(
        new Date(),
        "yyyy-MM-dd_HH-mm"
      )}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(`Exported ${exportData.length} records to ${fileName}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export. Please try again.");
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      open: {
        color: "bg-blue-100 text-blue-800",
        icon: <AlertCircle size={14} />,
        label: "OPEN",
      },
      in_progress: {
        color: "bg-orange-100 text-orange-800",
        icon: <Clock size={14} />,
        label: "IN PROGRESS",
      },
      resolved: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={14} />,
        label: "RESOLVED",
      },
      closed: {
        color: "bg-gray-100 text-gray-800",
        icon: <CheckCircle size={14} />,
        label: "CLOSED",
      },
    }[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: <AlertCircle size={14} />,
      label: status?.toUpperCase() || "UNKNOWN",
    };

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {config.label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue history...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-100 rounded-xl">
            <BarChart3 className="text-teal-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Issue History</h1>
            <p className="text-gray-600 mt-2">
              Track all issue status changes and activities
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards with Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Records */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 group relative">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Total Records</p>
                <div className="tooltip group">
                  <Info size={14} className="text-gray-400 cursor-help" />
                  <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 -top-10 left-0 w-48 z-10">
                    Total number of status changes in the system
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="text-gray-400" size={24} />
          </div>
        </div>

        {/* Changes Today */}
        <div className="bg-white p-4 rounded-xl shadow border border-blue-100 group relative">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Changes Today</p>
                <div className="tooltip group">
                  <Info size={14} className="text-blue-400 cursor-help" />
                  <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 -top-10 left-0 w-48 z-10">
                    Status changes made in the last 24 hours
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <Calendar className="text-blue-400" size={24} />
          </div>
        </div>

        {/* Last 7 Days */}
        <div className="bg-white p-4 rounded-xl shadow border border-orange-100 group relative">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Last 7 Days</p>
                <div className="tooltip group">
                  <Info size={14} className="text-orange-400 cursor-help" />
                  <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 -top-10 left-0 w-48 z-10">
                    Weekly activity trend (shows system usage)
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.week}</p>
            </div>
            <TrendingUp className="text-orange-400" size={24} />
          </div>
        </div>

        {/* Unique Issues - IMPORTANT */}
        <div className="bg-white p-4 rounded-xl shadow border border-teal-100 group relative">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Unique Issues</p>
                <div className="tooltip group">
                  <Info size={14} className="text-teal-400 cursor-help" />
                  <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 -top-10 left-0 w-48 z-10">
                    Different issues with activity. High number = good issue
                    coverage
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-teal-600">
                {stats.uniqueIssues}
              </p>
            </div>
            <FileText className="text-teal-400" size={24} />
          </div>
        </div>

        {/* Users Involved - IMPORTANT */}
        <div className="bg-white p-4 rounded-xl shadow border border-purple-100 group relative">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Users Involved</p>
                <div className="tooltip group">
                  <Info size={14} className="text-purple-400 cursor-help" />
                  <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 -top-10 left-0 w-48 z-10">
                    Different users who made changes. Shows team engagement
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.uniqueUsers}
              </p>
            </div>
            <User className="text-purple-400" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by issue title or user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <Calendar
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>

          {/* User Filter */}
          <div className="relative">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="all">All Users</option>
              {users.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="mx-auto text-gray-300" size={64} />
            <p className="text-lg text-gray-600 mt-4">
              No history records found
            </p>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Changed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {item.timestamp
                              ? format(new Date(item.timestamp), "MMM dd, yyyy")
                              : "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.timestamp
                              ? format(new Date(item.timestamp), "HH:mm:ss")
                              : "N/A"}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {item.timestamp
                              ? formatDistanceToNow(new Date(item.timestamp), {
                                  addSuffix: true,
                                })
                              : "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 truncate max-w-xs">
                            {item.issue?.title || "Issue Not Found"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            ID: {item.issue?.id?.substring(0, 8) || "N/A"}...
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.old_status ? (
                            <>
                              <StatusBadge status={item.old_status} />
                              <span className="text-gray-400">→</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Created
                            </span>
                          )}
                          <StatusBadge status={item.new_status} />
                        </div>
                        {item.old_status && (
                          <div className="text-xs text-gray-500 mt-2">
                            From{" "}
                            <span className="font-medium">
                              {item.old_status.toUpperCase()}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {item.new_status.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {item.changed_by ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                              <User className="text-teal-600" size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.changed_by.email || "Unknown User"}
                              </p>
                              {item.changed_by.first_name && (
                                <p className="text-xs text-gray-500">
                                  {item.changed_by.first_name}{" "}
                                  {item.changed_by.last_name || ""}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 capitalize">
                                {item.changed_by.role || "User"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Clock className="text-gray-600" size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                System
                              </p>
                              <p className="text-xs text-gray-500">
                                Automated action
                              </p>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {item.issue?.id && (
                            <a
                              href={`/app/issues/${item.issue.id}`}
                              className="p-2 hover:bg-gray-100 rounded transition"
                            >
                              <Eye size={18} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalCount)} of{" "}
                    {totalCount} records
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronDown size={16} className="transform rotate-90" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                currentPage === pageNum
                                  ? "bg-teal-600 text-white"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-2 text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-10 h-10 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                      <ChevronDown size={16} className="transform -rotate-90" />
                    </button>

                    {/* Page Size Selector */}
                    <div className="ml-4">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                      >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-500">
        <div>
          Showing {filteredHistory.length} records on this page
          {totalCount > filteredHistory.length &&
            ` (filtered from ${totalCount} total)`}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Closed</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
