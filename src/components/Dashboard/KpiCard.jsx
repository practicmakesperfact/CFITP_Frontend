import { motion } from "framer-motion";

export default function KpiCard({ title, value, icon: Icon, color = "teal" }) {
  const colorMap = {
    red: "text-red-500 bg-red-50",
    amber: "text-amber-500 bg-amber-50",
    emerald: "text-emerald-500 bg-emerald-50",
    teal: "text-[#0EA5A4] bg-teal-50",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    > 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${colorMap[color]}`}>
          <Icon size={32} />
        </div>
      </div>
    </motion.div>
  );
}
