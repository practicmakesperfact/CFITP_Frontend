import { motion } from "framer-motion";

const badgeStyles = {
  open: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-200 text-gray-700",
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-800 font-semibold",
};

export default function IssueCard({ issue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 cursor-pointer transition"
    >
      <h3 className="text-lg font-semibold text-text">{issue.title}</h3>

      <p className="text-gray-500 text-sm mt-2">
        {issue.description?.slice(0, 110)}...
      </p>

      <div className="mt-4 flex gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            badgeStyles[issue.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {issue.status}
        </span>

        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            priorityStyles[issue.priority] || "bg-gray-100 text-gray-700"
          }`}
        >
          {issue.priority}
        </span>
      </div>
    </motion.div>
  );
}
