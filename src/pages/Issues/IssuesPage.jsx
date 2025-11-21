// src/pages/Issues/IssuesPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useUIStore } from "../../app/store/uiStore.js";
import { issuesApi } from "../../api/issuesApi.js";

export default function IssuesPage() {
  const navigate = useNavigate();
  const { userRole } = useUIStore();
  const [search, setSearch] = useState("");

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["issues"], // Shared cache
    queryFn: () => issuesApi.list(),
  });

  const allIssues = issuesData?.data || [];
  const issues =
    userRole === "client"
      ? allIssues.filter(
          (i) =>
            i.created_by === "client@cfitp.com" ||
            i.created_by === localStorage.getItem("user_profile")?.email
        )
      : allIssues;

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold text-slate-800">
            {userRole === "client" ? "My Issues" : "All Issues"}
          </h1>
          <p className="text-xl text-slate-600 mt-2">
            {filteredIssues.length} issues found
          </p>
        </div>
        {userRole === "client" && (
          <button
            onClick={() => navigate("/issues/new")}
            className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-10 py-5 rounded-2xl flex items-center gap-4 shadow-2xl transition transform hover:scale-105 text-xl"
          >
            <Plus size={20} /> New Issue
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-3xl">
        <Search className="absolute left-6 top-5 text-gray-400" size={22} />
        <input
          type="text"
          placeholder="Search issues by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-16 pr-6 py-3 rounded-3xl border-2 border-gray-200 bg-white  outline-none text-xl transition"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-32">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-[#0EA5A4] border-t-transparent"></div>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-3xl shadow-2xl">
          <p className="text-8xl text-gray-200 mb-8">Empty</p>
          <p className="text-3xl text-slate-600 mb-10">
            You haven't created any issues yet
          </p>
          <button
            onClick={() => navigate("/issues/new")}
            className="bg-[#0EA5A4] text-white px-12 py-6 rounded-2xl text-2xl hover:bg-[#0d8c8b] transition shadow-2xl"
          >
            Create Your First Issue
          </button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredIssues.map((issue) => (
            <motion.div
              key={issue.id}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate(`/issues/${issue.id}`)}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-3xl"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                  {issue.title}
                </h3>
                <span
                  className={`px-5 py-2 rounded-full text-sm ${
                    issue.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : issue.priority === "medium"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {issue.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-600 text-lg mb-8 line-clamp-3">
                {issue.description}
              </p>
              <div className="flex justify-between items-center">
                <span
                  className={`px-6 py-3 rounded-full text-lg ${
                    issue.status === "open"
                      ? "bg-red-100 text-red-700"
                      : issue.status === "in-progress"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {issue.status.replace("-", " ").toUpperCase()}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {formatDistanceToNow(new Date(issue.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
