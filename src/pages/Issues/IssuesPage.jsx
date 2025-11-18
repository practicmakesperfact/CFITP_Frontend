// src/pages/Issues/IssuesPage.jsx
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import IssueCard from "../../components/Issues/IssueCard.jsx";

export default function IssuesPage() {
  const [search, setSearch] = useState("");
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  // Hardcoded issues (replace with API later)
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: "User can't login",
      description: "Login form returns 500 error for some users.",
      status: "open",
      priority: "high",
      created_at: "2025-11-18T02:15:00Z",
    },
    {
      id: 2,
      title: "Performance issue",
      description: "Slow loading dashboard...",
      status: "in-progress",
      priority: "medium",
      created_at: "2025-11-17T10:30:00Z",
    },
    {
      id: 3,
      title: "UI enhancement",
      description: "Improve mobile sidebar",
      status: "closed",
      priority: "low",
      created_at: "2025-11-16T14:20:00Z",
    },
  ]);

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateIssue = () => {
    if (!title.trim()) return;

    const newIssue = {
      id: Math.max(...issues.map((i) => i.id)) + 1,
      title,
      description,
      priority,
      status: "open",
      created_at: new Date().toISOString(),
    };

    setIssues([newIssue, ...issues]);
    setNewIssueOpen(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Issues</h1>
        <button
          onClick={() => setNewIssueOpen(true)}
          className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={20} />
          New Issue
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent"
        />
      </div>

      {/* Issues Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIssues.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">
            No issues found
          </p>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        )}
      </div>

      {/* New Issue Modal */}
      {newIssueOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Create New Issue</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-[#0EA5A4]"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-[#0EA5A4]"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-6"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNewIssueOpen(false)}
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIssue}
                className="px-6 py-3 rounded-xl bg-[#0EA5A4] text-white hover:bg-[#0d8c8b]"
              >
                Create Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
