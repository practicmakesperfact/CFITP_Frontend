
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { feedbackApi } from "../../api/feedbackApi";
import { useAuth } from "../../app/hooks";
import toast from "react-hot-toast";

export default function MyFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyFeedback();
    }
  }, [user]);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.my();
      setFeedback(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load your feedback");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <Clock className="text-blue-500" size={20} />;
      case "acknowledged":
        return <CheckCircle className="text-green-500" size={20} />;
      case "converted":
        return <AlertCircle className="text-purple-500" size={20} />;
      case "closed":
        return <CheckCircle className="text-gray-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "acknowledged":
        return "bg-green-100 text-green-800";
      case "converted":
        return "bg-purple-100 text-purple-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-10"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <MessageSquare className="text-[#0EA5A4]" size={36} />
          <div>
            <h1 className="text-4xl font-bold text-slate-800">My Feedback</h1>
            <p className="text-slate-600 mt-2">
              {feedback.length} feedback submission
              {feedback.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => (window.location.href = "/app/feedback")}
          className="px-6 py-3 bg-[#0EA5A4] hover:bg-teal-600 text-white rounded-xl font-medium transition"
        >
          Submit New Feedback
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
        {feedback.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="mx-auto text-gray-300" size={64} />
            <p className="text-xl text-slate-600 mt-6">
              You haven't submitted any feedback yet
            </p>
            <p className="text-slate-500 mt-2">
              Your feedback helps us improve our service
            </p>
            <button
              onClick={() => (window.location.href = "/app/feedback")}
              className="mt-8 px-8 py-3 bg-[#0EA5A4] hover:bg-teal-600 text-white rounded-xl font-medium transition"
            >
              Submit Your First Feedback
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0EA5A4] transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300">
                  <div className="text-sm text-slate-500">
                    Submitted{" "}
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </div>

                  {item.converted_to_issue && (
                    <a
                      href={`/app/issues/${item.converted_to_issue}`}
                      className="text-sm text-[#0EA5A4] hover:text-teal-600 font-medium"
                    >
                      View Related Issue →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
