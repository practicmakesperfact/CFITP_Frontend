
import { motion } from "framer-motion";

export default function IssueCard({ issue }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition"
      initial={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-lg font-semibold text-text">{issue.title}</h3>
      <p className="text-gray-500 text-sm mt-2">
        {issue.description.slice(0, 100)}...
      </p>
      <div className="mt-4 flex gap-2">
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
          {issue.status}
        </span>
        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
          {issue.priority}
        </span>
      </div>
    </motion.div>
  );
}
