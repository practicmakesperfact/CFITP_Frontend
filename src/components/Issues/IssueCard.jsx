import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  ArrowRight,
} from "lucide-react";

export default function IssueCard({ issue }) {
  const navigate = useNavigate();

  const statusStyles = {
    open: "bg-red-100 text-red-700",
    "in-progress": "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-gray-200 text-gray-700",
  };

  const priorityColor = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
    critical: "bg-purple-100 text-purple-700",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/issues/${issue.id}`)}
      className="cursor-pointer p-6 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition"
    >
      {/* TITLE*/}
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800 line-clamp-2">
          {issue.title}
        </h2>
        
      </div>

      {/* STATUS + PRIORITY */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            statusStyles[issue.status]
          }`}
        >
          {issue.status.replace("-", " ").toUpperCase()}
        </span>

        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            priorityColor[issue.priority]
          }`}
        >
          {issue.priority.toUpperCase()}
        </span>
      </div>

      {/* DESCRIPTION PREVIEW */}
      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
        {issue.description}
      </p>

      {/* FOOTER */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {/* CREATED BY */}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <User size={16} />
          <span>{issue.created_by_name}</span>
        </div>

        {/* STATUS ICON */}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          {issue.status === "open" && <AlertCircle size={18} />}
          {issue.status === "in-progress" && <Clock size={18} />}
          {issue.status === "resolved" && <CheckCircle size={18} />}
          <ArrowRight size={18} />
        </div>
      </div>
    </motion.div>
  );
}
