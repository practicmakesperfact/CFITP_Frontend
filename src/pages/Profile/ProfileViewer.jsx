
import { motion } from "framer-motion";
import { useAuth } from "../../app/hooks.js";
import ActivityTimeline from "../../components/Profile/ActivityTimeline.jsx";

export default function ProfileViewer() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center text-4xl font-bold text-primary">
            {user.first_name[0]}
            {user.last_name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-lg text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-lg font-medium text-text">November 2025</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Issues</p>
            <p className="text-lg font-medium text-text">24</p>
          </div>
        </div>
      </div>

      <ActivityTimeline />
    </motion.div>
  );
}
