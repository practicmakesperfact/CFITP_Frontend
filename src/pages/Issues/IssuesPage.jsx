import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import IssueCard from "../../components/issues/IssueCard.jsx";

export default function IssuesPage() {
  // Fake initial issues (local only)
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: "User can't login",
      description: "Login form returns 500 error",
      status: "open",
      priority: "high",
    },
    {
      id: 2,
      title: "Performance issue",
      description: "Slow loading dashboard",
      status: "in-progress",
      priority: "medium",
    },
    {
      id: 3,
      title: "UI enhancement",
      description: "Improve sidebar hover",
      status: "closed",
      priority: "low",
    },
  ]);

  // UI + Form state
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  // New Issue fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status] = useState("open");

  // FILTER + SEARCH logic
  const filteredIssues = issues
    .filter((issue) => issue.title.toLowerCase().includes(search.toLowerCase()))
    .filter((issue) => (statusFilter ? issue.status === statusFilter : true))
    .filter((issue) =>
      priorityFilter ? issue.priority === priorityFilter : true
    );

  // Create issue (local only)
  const handleCreateIssue = () => {
    if (!title.trim()) return alert("Title required!");

    const newIssue = {
      id: issues.length + 1,
      title,
      description,
      priority,
      status,
    };

    setIssues([newIssue, ...issues]); // Add on top
    setNewIssueOpen(false);

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Issues</h1>

        <button
          onClick={() => setNewIssueOpen(true)}
          className="bg-[#0EA5A4] hover:bg-[#0C8F8D] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> New Issue
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search issues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#0EA5A4]"
          />
        </div>

        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm flex items-center gap-2"
        >
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* FILTER PANEL */}
      {filterOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
          <h2 className="text-xl font-semibold">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setStatusFilter("");
              setPriorityFilter("");
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ISSUES LIST */}
      <div className="grid gap-4">
        {filteredIssues.length === 0 ? (
          <p className="text-center text-gray-600 py-10">No issues found.</p>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        )}
      </div>

      {/* NEW ISSUE MODAL */}
      {newIssueOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">Create New Issue</h2>

            {/* Title */}
            <input
              type="text"
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            {/* Description */}
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 h-28"
            />

            {/* Priority */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNewIssueOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateIssue}
                className="px-4 py-2 rounded-lg bg-[#0EA5A4] text-white shadow"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
