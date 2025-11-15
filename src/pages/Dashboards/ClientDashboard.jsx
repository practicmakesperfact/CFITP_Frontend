import { motion } from "framer-motion";

export default function ClientDashboard() {
  const card = "bg-white border border-gray-200 rounded-xl p-6 shadow-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Client Dashboard
      </h1>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={card}>
          <h3 className="text-sm font-medium text-slate-500">Open Issues</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">12</p>
        </div>

        <div className={card}>
          <h3 className="text-sm font-medium text-slate-500">Resolved</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">48</p>
        </div>

        <div className={card}>
          <h3 className="text-sm font-medium text-slate-500">
            Avg. Response Time
          </h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">2.3h</p>
        </div>
      </div>

      {/* Activity */}
      <div className={card}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Recent Activity
        </h2>
        <p className="text-slate-600">
          Your issues are being handled efficiently.
        </p>
      </div>
    </motion.div>
  );
}
