import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useUIStore } from "../../app/store/uiStore.js";
import { useAuth } from "../../app/hooks.js";
import { issuesApi } from "../../api/issuesApi.js";
import IssueCard from "../../components/Issues/IssueCard.jsx";
import { useState, useEffect } from "react";

export default function IssuesPage() {
  const { userRole } = useUIStore();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Get user from localStorage as fallback
  const getLocalUser = () => {
    try {
      const userStr = localStorage.getItem("user_profile");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  const user = currentUser || getLocalUser();
  const userEmail = user?.email || "";
  const userId = user?.id || "";

  const {
    data: issuesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["issues", page, userEmail, userRole],
    queryFn: () => issuesApi.list({ page }),
    enabled: !authLoading,
  });

 

  const issues = issuesData?.results || [];

  const filteredIssues = (() => {
    if (userRole === "client") {
      // FIX: Check both reporter_email AND created_by_email
      const clientIssues = issues.filter((issue) => {
        const matches =
          issue.reporter_email === userEmail ||
          issue.created_by_email === userEmail ||
          (issue.reporter && issue.reporter.id === userId) ||
          (issue.created_by && issue.created_by.id === userId);
        return matches;
      });

     
      return clientIssues;
    }

    if (userRole === "staff") {
      // FIX: Check both assignee_email AND assignee.id
      const staffIssues = issues.filter((issue) => {
        const matches =
          issue.assignee_email === userEmail ||
          (issue.assignee && issue.assignee.id === userId);
        return matches;
      });

      return staffIssues;
    }
   
    return issues;
  })();
  const handleNextPage = () => {
    if (issuesData?.next) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (issuesData?.previous) setPage(page - 1);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Issues</h1>

        <div className="text-sm text-slate-500">
          Page {page} • Showing {filteredIssues.length} of{" "}
          {issuesData?.count || 0} issues
        </div>

        {userRole === "client" && (
          <button
            onClick={() => navigate("/app/issues/new")}
            className="bg-[#0EA5A4] hover:bg-[#0c8a89] text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md"
          >
            <Plus size={20} /> New Issue
          </button>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {issuesData && (issuesData.next || issuesData.previous) && (
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border">
          <button
            onClick={handlePrevPage}
            disabled={!issuesData.previous}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-sm text-slate-600">
            Page {page} of {Math.ceil(issuesData.count / 10)}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!issuesData.next}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">Error loading issues: {error.message}</p>
        </div>
      )}

      {/* LOADING/EMPTY STATE */}
      {isLoading ? (
        <p className="text-center py-20 text-slate-500">Loading issues...</p>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">
            No issues found for your role on this page.
          </p>
          <p className="text-sm text-slate-400">
            Try browsing other pages or create a new issue.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            DEBUG: User email: {userEmail} | User ID: {userId}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </motion.div>
  );
}