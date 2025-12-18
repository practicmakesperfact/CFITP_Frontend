
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MessageSquare, Send } from "lucide-react";
import { feedbackApi } from "../../api/feedbackApi";
import { useAuth } from "../../app/hooks";

export default function FeedbackPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pre-fill email if user is logged in
  useState(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please write your feedback first");
      return;
    }

    if (!title.trim()) {
      toast.error("Please add a title for your feedback");
      return;
    }

    setLoading(true);

    try {
      const feedbackData = {
        title: title.trim(),
        description: description.trim(),
        user_email: email.trim() || null,
      };

      const response = await feedbackApi.create(feedbackData);

      toast.success("Thank you! Your feedback has been submitted.");

      // Reset form
      setTitle("");
      setDescription("");

      // Navigate to my feedback page
      setTimeout(() => navigate("/app/feedback/my"), 1500);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(
        error.response?.data?.detail ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-10"
    >
      <div className="flex items-center gap-3 mb-10">
        <MessageSquare className="text-[#0EA5A4]" size={36} />
        <h1 className="text-4xl font-bold text-slate-800">Submit Feedback</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-200">
        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your feedback..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0EA5A4] focus:ring-2 focus:ring-teal-100 outline-none text-lg"
          />
        </div>

        {/* Description Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Feedback
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="We'd love to hear your thoughts! Suggestions, praise, or anything you'd like to share..."
            rows={10}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0EA5A4] focus:ring-2 focus:ring-teal-100 outline-none resize-none"
          />
        </div>

        {/* Email Input (for non-logged in users) */}
        {!user && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Email (Optional)
              <span className="text-slate-500 text-sm ml-2">
                - Provide email to receive updates
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0EA5A4] focus:ring-2 focus:ring-teal-100 outline-none"
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-10">
          <button
            onClick={() => navigate("/app/feedback/my")}
            className="px-8 py-3 rounded-xl font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            disabled={loading}
          >
            View My Feedback
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !description.trim() || !title.trim()}
            className="bg-[#FB923C] hover:bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-12 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-4 transition transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={24} />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
