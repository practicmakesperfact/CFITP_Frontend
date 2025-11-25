
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MyFeedback() {
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");
  const clientEmail = user.email || "client@example.com";

  const allFeedback = JSON.parse(
    localStorage.getItem("cfitp_feedback") || "[]"
  );
  const myFeedback = allFeedback.filter((f) => f.authorEmail === clientEmail);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-10"
    >
      <div className="flex items-center gap-4 mb-10">
        <MessageSquare className="text-[#0EA5A4]" size={36} />
        <h1 className="text-4xl font-bold text-slate-800">My Feedback</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10">
        {myFeedback.length === 0 ? (
          <p className="text-center py-20 text-xl text-slate-600">
            You haven't submitted any feedback yet
          </p>
        ) : (
          <div className="space-y-6">
            {myFeedback.map((item) => (
              <div key={item.id} className="p-6 bg-gray-50 rounded-2xl border">
                <p className="text-slate-700 leading-relaxed">{item.text}</p>
                <p className="text-sm text-slate-500 mt-4">
                  Sent{" "}
                  {formatDistanceToNow(new Date(item.date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
