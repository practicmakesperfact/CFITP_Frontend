
import { motion } from "framer-motion";

export default function NotificationItem({ notification }) {
  return (
    <motion.div
      className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1">
        <p className="text-text font-medium">{notification.message}</p>
        <p className="text-text-light text-sm">{notification.time}</p>
      </div>
      <button className="text-primary text-sm">Mark Read</button>
    </motion.div>
  );
}
