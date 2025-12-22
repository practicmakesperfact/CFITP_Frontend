
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

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch issue history
      const historyResponse = await issueHistoryApi.listAll();
      const historyData = historyResponse.results || historyResponse || [];
      setHistory(historyData);

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
  }, [user]);

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

  // Stats
  const stats = {
    total: history.length,
    today: history.filter(
      (item) =>
        new Date(item.timestamp).toDateString() === new Date().toDateString()
    ).length,
    week: history.filter(
      (item) => new Date(item.timestamp) >= subDays(new Date(), 7)
    ).length,
    uniqueIssues: [...new Set(history.map((item) => item.issue?.id))].length,
    uniqueUsers: [...new Set(history.map((item) => item.changed_by?.email))]
      .length,
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = filteredHistory.map((item) => ({
      "Issue ID": item.issue?.id.substring(0, 8) || "N/A",
      "Issue Title": item.issue?.title || "N/A",
      "Changed By": item.changed_by?.email || "System",
      "Old Status": item.old_status?.toUpperCase() || "N/A",
      "New Status": item.new_status?.toUpperCase() || "N/A",
      Timestamp: format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss"),
      "Time Since": formatDistanceToNow(new Date(item.timestamp), {
        addSuffix: true,
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issue History");

    const fileName = `issue_history_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`Exported ${exportData.length} history records`);
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
      label: status?.toUpperCase(),
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total History Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="text-gray-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Changes Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <Calendar className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Last 7 Days</p>
              <p className="text-2xl font-bold text-orange-600">{stats.week}</p>
            </div>
            <TrendingUp className="text-orange-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-teal-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Unique Issues</p>
              <p className="text-2xl font-bold text-teal-600">
                {stats.uniqueIssues}
              </p>
            </div>
            <FileText className="text-teal-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Users Involved</p>
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
                  <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          {format(new Date(item.timestamp), "MMM dd, yyyy")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.timestamp), "HH:mm:ss")}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(item.timestamp), {
                            addSuffix: true,
                          })}
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
                          <span className="text-gray-400 text-sm">Created</span>
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
                              {item.changed_by.email}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {item.changed_by.role || "User"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          System
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {item.issue?.id && (
                          <a
                            href={`/app/issues/${item.issue.id}`}
                            className="p-2 hover:bg-gray-100 rounded transition"
                            title="View Issue"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const details = `
Issue History Record
------------------------
ID: ${item.id}
Timestamp: ${format(new Date(item.timestamp), "PPP pp")}
Issue: ${item.issue?.title || "N/A"}
Issue ID: ${item.issue?.id || "N/A"}
Changed By: ${item.changed_by?.email || "System"}
From Status: ${item.old_status || "N/A"}
To Status: ${item.new_status}
                            `.trim();

                            navigator.clipboard.writeText(details);
                            toast.success("Details copied to clipboard");
                          }}
                          className="p-2 hover:bg-gray-100 rounded transition"
                          title="Copy Details"
                        >
                          <FileText size={16} className="text-teal-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {filteredHistory.length} of {history.length} history records
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
