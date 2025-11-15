
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const mockActivity = [
  {
    id: 1,
    action: "Created issue #123",
    time: new Date(Date.now() - 2 * 3600000),
  },
  {
    id: 2,
    action: "Commented on issue #122",
    time: new Date(Date.now() - 24 * 3600000),
  },
  {
    id: 3,
    action: "Submitted feedback",
    time: new Date(Date.now() - 48 * 3600000),
  },
];

export default function ActivityTimeline() {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-text mb-6">Activity Timeline</h2>
      <div className="space-y-6">
        {mockActivity.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4"
          >
            <div className="w-3 h-3 bg-primary rounded-full mt-1.5"></div>
            <div className="flex-1">
              <p className="text-text font-medium">{item.action}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(item.time, { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
