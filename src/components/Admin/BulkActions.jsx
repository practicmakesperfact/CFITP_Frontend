
import { UserCheck, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BulkActions({ selectedCount, onBulkAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-teal-50 border border-teal-200 rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="text-teal-600" size={20} />
          <span className="font-medium text-teal-800">
            {selectedCount} user{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onBulkAction("activate")}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Activate
          </button>
          <button
            onClick={() => onBulkAction("deactivate")}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            Deactivate
          </button>
          <button
            onClick={() => onBulkAction("export")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => onBulkAction("delete")}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}
