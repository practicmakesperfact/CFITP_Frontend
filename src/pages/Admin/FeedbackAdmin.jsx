
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  Eye,
  FileText,
  ChevronDown,
  RefreshCw,
  Users,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import * as XLSX from 'xlsx';
import { feedbackApi } from "../../api/feedbackApi";
import { useAuth } from "../../app/hooks";
import toast from "react-hot-toast";
import { Link } from 'react-router-dom';
export default function FeedbackAdmin() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    acknowledged: 0,
    converted: 0,
    closed: 0
  });

  // Fetch all feedback
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.listAll();
      const data = response.data.results || response.data || [];
      setFeedback(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        new: data.filter(f => f.status === 'new').length,
        acknowledged: data.filter(f => f.status === 'acknowledged').length,
        converted: data.filter(f => f.status === 'converted').length,
        closed: data.filter(f => f.status === 'closed').length
      });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchFeedback();
    }
  }, [user]);

  // Filter feedback
  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user?.email && item.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    const matchesUser = 
      userFilter === "all" || 
      (userFilter === "has_user" && item.user) ||
      (userFilter === "anonymous" && !item.user);
    
    return matchesSearch && matchesStatus && matchesUser;
  });

  // Handle bulk actions
  const handleBulkAcknowledge = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select items first");
      return;
    }
    
    try {
      const promises = selectedItems.map(id => feedbackApi.acknowledge(id));
      await Promise.all(promises);
      toast.success(`${selectedItems.length} feedback items acknowledged`);
      fetchFeedback();
      setSelectedItems([]);
    } catch (error) {
      toast.error("Failed to acknowledge feedback");
    }
  };

  const handleExportCSV = () => {
    if (filteredFeedback.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Prepare data for export
    const exportData = filteredFeedback.map(item => ({
      ID: item.id.substring(0, 8),
      Title: item.title,
      Description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
      Status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      User: item.user?.email || 'Anonymous',
      'Created Date': format(new Date(item.created_at), 'yyyy-MM-dd HH:mm'),
      'Converted Issue': item.converted_to ? `Issue #${item.converted_to.id.substring(0, 8)}` : 'No'
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");
    
    // Generate Excel file
    const fileName = `feedback_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success(`Exported ${exportData.length} feedback items`);
  };

  // View details handler
  const handleViewDetails = (feedback) => {
    const details = `
      ID: ${feedback.id}
      Title: ${feedback.title}
      Description: ${feedback.description}
      Status: ${feedback.status}
      User: ${feedback.user?.email || 'Anonymous'}
      Created: ${format(new Date(feedback.created_at), 'PPP p')}
      ${feedback.converted_to ? `Converted to Issue: #${feedback.converted_to.id.substring(0, 8)}` : ''}
    `;
    
    if (window.confirm(details + "\n\nCopy details to clipboard?")) {
      navigator.clipboard.writeText(details);
      toast.success("Details copied to clipboard");
    }
  };

  // Convert to issue handler
  const handleConvertToIssue = async (feedback) => {
    if (feedback.status === 'converted') {
      toast.error("Already converted to issue");
      return;
    }
    
    const issueTitle = window.prompt("Enter issue title:", feedback.title);
    if (!issueTitle) return;
    
    const priority = window.prompt("Enter priority (low/medium/high/critical):", "medium");
    
    try {
      const response = await feedbackApi.convert(feedback.id, {
        title: issueTitle,
        priority: priority || 'medium'
      });
      
      toast.success(`Feedback converted to issue #${response.data.issue.id.substring(0, 8)}`);
      fetchFeedback(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to convert feedback");
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      new: { color: "bg-blue-100 text-blue-800", icon: <Clock className="text-blue-500" size={14} />, label: "New" },
      acknowledged: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="text-green-500" size={14} />, label: "Acknowledged" },
      converted: { color: "bg-purple-100 text-purple-800", icon: <AlertCircle className="text-purple-500" size={14} />, label: "Converted" },
      closed: { color: "bg-gray-100 text-gray-800", icon: <CheckCircle className="text-gray-500" size={14} />, label: "Closed" }
    };
    
    const config = statusConfig[status] || statusConfig.new;
    
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
          <p className="text-gray-600">Loading feedback data...</p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="text-teal-600" size={32} />
            Feedback Administration
          </h1>
          <p className="text-gray-600 mt-2">Manage and analyze all client feedback</p>
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
            onClick={fetchFeedback}
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
              <p className="text-sm text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="text-gray-400" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <Clock className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Acknowledged</p>
              <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Converted</p>
              <p className="text-2xl font-bold text-purple-600">{stats.converted}</p>
            </div>
            <AlertCircle className="text-purple-400" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            </div>
            <CheckCircle className="text-gray-400" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search feedback by title, description, or email..."
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
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white w-full lg:w-auto"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* User Filter */}
          <div className="relative">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white w-full lg:w-auto"
            >
              <option value="all">All Users</option>
              <option value="has_user">Has Account</option>
              <option value="anonymous">Anonymous</option>
            </select>
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-teal-700 font-medium">
                {selectedItems.length} selected
              </span>
              <button
                onClick={handleBulkAcknowledge}
                className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
              >
                Acknowledge Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="mx-auto text-gray-300" size={64} />
            <p className="text-lg text-gray-600 mt-4">No feedback found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredFeedback.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredFeedback.map(f => f.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title & Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFeedback.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {item.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {item.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      {item.user ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <User className="text-teal-500" size={16} />
                            <span className="text-sm text-gray-900">{item.user.email}</span>
                          </div>
                          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded mt-1 w-fit">
                            Registered User
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 italic">Anonymous</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 w-fit">
                            Guest Feedback
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                            to={`/app/admin/feedback/${item.id}`}
                            className="p-2 hover:bg-gray-100 rounded transition"
                            title="View Details"
                            >
                            <Eye size={18} className="text-gray-600" />
                        </Link>
                        
                        {item.status !== 'converted' && (
                          <button
                            onClick={() => handleConvertToIssue(item)}
                            className="p-2 hover:bg-purple-50 rounded transition"
                            title="Convert to Issue"
                          >
                            <FileText size={18} className="text-purple-600" />
                          </button>
                            )}
                    {item.converted_to && (
                        <Link
                            to={`/app/issues/${item.converted_to.id}`}
                            className="p-2 hover:bg-teal-50 rounded transition"
                            title="View Issue"
                        >
                            <ExternalLink size={18} className="text-teal-600" />
                        </Link>
                    )}
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
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredFeedback.length} of {feedback.length} feedback items
      </div>
    </motion.div>
  );
}