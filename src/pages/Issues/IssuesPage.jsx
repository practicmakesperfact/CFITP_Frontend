import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import IssueCard from "../../components/Issues/IssueCard.jsx";

const mockIssues = [
  {
    id: 1,
    title: "Login not working",
    status: "open",
    priority: "high",
    description: "User can't login.",
    created: "2 hours ago",
  },
  {
    id: 2,
    title: "Dashboard slow",
    status: "in-progress",
    priority: "medium",
    description: "Performance issue.",
    created: "1 day ago",
  },
  {
    id: 3,
    title: "Add dark mode",
    status: "closed",
    priority: "low",
    description: "UI enhancement.",
    created: "3 days ago",
  },
];

export default function IssuesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockIssues.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">Issues</h1>
        <button className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <Plus className="w-5 h-5" /> New Issue
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>

        <button className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filter
        </button>
      </div>

      {/* Issue Cards List */}
      <div className="grid gap-4">
        {filtered.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
