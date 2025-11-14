
import { motion } from "framer-motion";

const mockActivity = [
  { id: 1, action: "Issue #123 resolved", time: "2 hours ago" },
  { id: 2, action: "New comment on Feedback #45", time: "1 day ago" },
];

export default function ActivityFeed() {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-text mb-4">Recent Activity</h3>
      <ul className="space-y-3">
        {mockActivity.map((item) => (
          <li
            key={item.id}
            className="flex justify-between text-sm text-gray-500"
          >
            <span>{item.action}</span>
            <span>{item.time}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
