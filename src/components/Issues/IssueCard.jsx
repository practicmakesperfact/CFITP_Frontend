import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/issues/${issue.id}`)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="
        bg-white 
        rounded-xl 
        p-6 
        border border-gray-200 
        shadow-sm 
        hover:shadow-md 
        transition
        cursor-pointer
      "
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900">{issue.title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mt-2">
        {issue.description?.slice(0, 110)}...
      </p>

      {/* Badges */}
      <div className="mt-4 flex gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            badgeStyles[issue.status]
          }`}
        >
          {issue.status}
        </span>

        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            priorityStyles[issue.priority]
          }`}
        >
          {issue.priority}
        </span>
      </div>
    </motion.div>
  );
}
