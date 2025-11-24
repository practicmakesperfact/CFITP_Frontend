import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AssignModal({ issue, onClose, onAssign }) {
  const [staffList, setStaffList] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Mock staff list — replace with API call later
    const list = [
      { name: "John Doe", email: "john@company.com" },
      { name: "Sarah K", email: "sarah@company.com" },
      { name: "Mike P", email: "mike@company.com" },
    ];
    setStaffList(list);
  }, []);

  const handleAssign = () => {
    if (!selected) return;
    onAssign({ assignee_name: selected.name, assignee_email: selected.email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 z-10"
      >
        <h3 className="text-xl font-semibold mb-4">
          Assign staff to: {issue.title}
        </h3>
        <div className="space-y-2">
          {staffList.map((s) => (
            <label
              key={s.email}
              className={`block p-3 rounded-xl border ${
                selected?.email === s.email
                  ? "border-[#0EA5A4] bg-teal-50"
                  : "border-gray-200"
              } cursor-pointer`}
            >
              <input
                type="radio"
                name="assignee"
                className="mr-3"
                checked={selected?.email === s.email}
                onChange={() => setSelected(s)}
              />
              <span className="font-medium">{s.name}</span>
              <div className="text-xs text-slate-500">{s.email}</div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="px-5 py-2 rounded-xl bg-[#0EA5A4] text-white"
          >
            {selected ? "Assign" : "Select staff"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
