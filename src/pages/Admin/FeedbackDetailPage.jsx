
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy,
  MessageSquare,
  Shield,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { feedbackApi } from "../../api/feedbackApi";
import toast from "react-hot-toast";

export default function FeedbackDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.get(id);
      setFeedback(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback details");
      navigate("/app/admin/feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToIssue = async () => {
    if (feedback.status === 'converted') {
      toast.error("Already converted to issue");
      return;
    }

    const issueTitle = window.prompt("Enter issue title:", feedback.title);
    if (!issueTitle) return;

    const priority = window.prompt("Enter priority (low/medium/high/critical):", "medium");

    try {
      setConverting(true);
      const response = await feedbackApi.convert(feedback.id, {
        title: issueTitle,
        priority: priority || 'medium'
      });
      
      toast.success(`Feedback converted to issue #${response.data.issue.id.substring(0, 8)}`);
      fetchFeedback(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to convert feedback");
    } finally {
      setConverting(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      await feedbackApi.acknowledge(feedback.id);
      toast.success("Feedback acknowledged");
      fetchFeedback();
    } catch (error) {
      toast.error("Failed to acknowledge feedback");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await feedbackApi.delete(feedback.id);
        toast.success("Feedback deleted");
        navigate("/app/admin/feedback");
      } catch (error) {
        toast.error("Failed to delete feedback");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback details...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-gray-300" size={64} />
        <p className="text-xl text-gray-600 mt-6">Feedback not found</p>
        <button
          onClick={() => navigate("/app/admin/feedback")}
          className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Back to Feedback List
        </button>
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const config = {
      new: { color: "bg-blue-100 text-blue-800", icon: <Clock size={16} />, label: "New" },
      acknowledged: { color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} />, label: "Acknowledged" },
      converted: { color: "bg-purple-100 text-purple-800", icon: <ExternalLink size={16} />, label: "Converted" },
      closed: { color: "bg-gray-100 text-gray-800", icon: <CheckCircle size={16} />, label: "Closed" }
    }[status];

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.color}`}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/admin/feedback")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback Details</h1>
            <p className="text-gray-600">ID: {feedback.id.substring(0, 12)}...</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              const details = JSON.stringify(feedback, null, 2);
              navigator.clipboard.writeText(details);
              toast.success("Feedback data copied to clipboard");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Copy size={16} />
            Copy Data
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <MessageSquare className="text-teal-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{feedback.title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={feedback.status} />
                    <span className="text-sm text-gray-500">
                      Created {format(new Date(feedback.created_at), 'PPP')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-line">{feedback.description}</p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.status === 'new' && (
                <button
                  onClick={handleAcknowledge}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle size={18} />
                  Acknowledge Feedback
                </button>
              )}
              
              {feedback.status !== 'converted' && (
                <button
                  onClick={handleConvertToIssue}
                  disabled={converting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Convert to Issue
                    </>
                  )}
                </button>
              )}

              {feedback.converted_to && (
                <a
                  href={`/app/issues/${feedback.converted_to.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={18} />
                  View Related Issue
                </a>
              )}

              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <ArrowLeft size={18} />
                Back to List
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Submitted by</p>
                  <p className="font-medium">
                    {feedback.user?.email || 'Anonymous User'}
                  </p>
                </div>
              </div>
              
              {feedback.user && (
                <div className="flex items-center gap-3">
                  <Shield className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">
                      {feedback.user.role || 'Client'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Feedback ID</span>
                <code className="text-sm font-mono text-gray-800">
                  {feedback.id.substring(0, 8)}...
                </code>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-800">
                  {format(new Date(feedback.created_at), 'PPpp')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="text-gray-800">
                  {format(new Date(feedback.updated_at || feedback.created_at), 'PPpp')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Description Length</span>
                <span className="text-gray-800">
                  {feedback.description.length} characters
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">User Type</span>
                <span className="text-gray-800">
                  {feedback.user ? 'Registered' : 'Anonymous'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Feedback Created</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(feedback.created_at), 'PPpp')}
                  </p>
                </div>
              </div>
              
              {feedback.status === 'acknowledged' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Acknowledged</p>
                    <p className="text-sm text-gray-500">By support team</p>
                  </div>
                </div>
              )}
              
              {feedback.status === 'converted' && feedback.converted_to && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Converted to Issue</p>
                    <p className="text-sm text-gray-500">
                      Issue #{feedback.converted_to.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
              )}
              
              {feedback.status === 'closed' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Closed</p>
                    <p className="text-sm text-gray-500">Feedback resolved</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}