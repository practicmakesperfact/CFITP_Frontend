// src/pages/Feedback/FeedbackPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MessageSquare, Send } from "lucide-react";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!feedback.trim()) {
      toast.error("Please write your feedback first");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user_profile") || "{}");
    const clientEmail = user.email || "client@example.com";

    const allFeedback = JSON.parse(
      localStorage.getItem("cfitp_feedback") || "[]"
    );

    allFeedback.unshift({
      id: Date.now(),
      text: feedback,
      author: "Client",
      authorEmail: clientEmail,
      date: new Date().toISOString(),
      read: false,
    });

    localStorage.setItem("cfitp_feedback", JSON.stringify(allFeedback));
    toast.success("Thank you! Your feedback has been sent.");
    setFeedback("");
    setTimeout(() => navigate("/feedback/my"), 1500);
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
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="We'd love to hear your thoughts! Suggestions, praise, or anything you'd like to share..."
          rows={14}
          className="w-full px-6 py-5 rounded-2xl border border-gray-300 focus:border-[#0EA5A4] focus:ring-4 focus:ring-teal-100 outline-none resize-none text-lg transition"
        />

        <div className="flex justify-end mt-10">
          <button
            onClick={handleSubmit}
            className="bg-[#FB923C] hover:bg-orange-500 text-white px-12 py-5 rounded-2xl font-bold shadow-xl flex items-center gap-4 transition transform hover:scale-105"
          >
            <Send size={28} />
            Send Feedback
          </button>
        </div>
      </div>
    </motion.div>
  );
}
