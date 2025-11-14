
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";

const mockFeedback = [
  { id: 1, title: "UI is slow", status: "new", date: "2 days ago" },
  {
    id: 2,
    title: "Add export button",
    status: "converted",
    date: "1 week ago",
  },
];

export default function FeedbackPage() {
  const [search, setSearch] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Feedback</h1>
        <button className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" /> Submit Feedback
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600"
        />
      </div>

      <div className="grid gap-4">
        {mockFeedback.map((f) => (
          <div
            key={f.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
          >
            <h3 className="font-semibold text-text">{f.title}</h3>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{f.status}</span>
              <span>{f.date}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
