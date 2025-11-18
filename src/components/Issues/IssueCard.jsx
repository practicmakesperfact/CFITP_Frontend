import { motion } from "framer-motion";

// STATUS COLORS
const statusColors = {
  open: "bg-emerald-500/10 text-emerald-700 border border-emerald-300",
  "in-progress": "bg-yellow-500/10 text-yellow-700 border border-yellow-300",
  closed: "bg-gray-500/10 text-gray-700 border border-gray-300",
};

// PRIORITY COLORS
const priorityColors = {
  low: "bg-blue-500/10 text-blue-700 border border-blue-300",
  medium: "bg-orange-500/10 text-orange-700 border border-orange-300",
  high: "bg-red-500/10 text-red-700 border border-red-300",
  critical: "bg-red-600/20 text-red-800 border border-red-400 font-semibold",
};

export default function IssueCard({ issue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      className="bg-[#111C2D] text-white rounded-xl shadow-lg p-6 border border-[#1e293b] transition cursor-pointer hover:shadow-xl"
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-white tracking-wide">
        {issue.title}
      </h3>

      {/* Description */}
      <p className="text-gray-300 text-sm mt-2 leading-relaxed">
        {(issue.description || "No description provided.").slice(0, 120)}
        {issue.description?.length > 120 ? "..." : ""}
      </p>

      {/* Badges */}
      <div className="mt-4 flex gap-2">
        {/* STATUS */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            statusColors[issue.status]
          }`}
        >
          {issue.status}
        </span>

        {/* PRIORITY */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            priorityColors[issue.priority]
          }`}
        >
          {issue.priority}
        </span>
      </div>
    </motion.div>
  );
}
