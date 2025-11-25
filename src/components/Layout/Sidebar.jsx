
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, CheckCircle } from "lucide-react";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/illustrations/empty-state.json";

export default function ClientFeedbackList() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem("cfitp_feedback") || "[]");
      setFeedback(data.sort((a, b) => b.date.localeCompare(a.date)));
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const markAsRead = (id) => {
    const updated = feedback.map((f) =>
      f.id === id ? { ...f, read: true } : f
    );
    localStorage.setItem("cfitp_feedback", JSON.stringify(updated));
    setFeedback(updated);
  };

  const unreadCount = feedback.filter((f) => !f.read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-10"
    >
      <div className="flex items-center gap-4 mb-10">
        <MessageSquare className="text-[#0EA5A4]" size={36} />
        <h1 className="text-4xl font-bold text-slate-800">Client Feedback</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {unreadCount} Unread
          </span>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200">
        {feedback.length === 0 ? (
          <div className="text-center py-24">
            <Lottie animationData={emptyAnimation} className="w-80 mx-auto" />
            <p className="text-2xl text-slate-600 mt-8">
              No feedback from clients yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`p-8 ${
                  item.read
                    ? "bg-gray-50"
                    : "bg-teal-50 border-l-4 border-[#0EA5A4]"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-xl text-slate-800">
                      {item.author || "Client"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(item.date), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="flex items-center gap-2 text-sm text-[#0EA5A4] hover:underline font-medium"
                    >
                      <CheckCircle size={18} /> Mark as read
                    </button>
                  )}
                </div>
                <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
