
import { motion } from "framer-motion";
import NotificationItem from "../components/Notifications/NotificationItem.jsx";

const mockNotifications = [
  {
    id: 1,
    message: "New comment on issue #123",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    message: "Issue #122 assigned to you",
    time: "1 day ago",
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-text mb-6">Notifications</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg divide-y divide-gray-200 dark:divide-gray-700">
        {mockNotifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </div>
    </motion.div>
  );
}
