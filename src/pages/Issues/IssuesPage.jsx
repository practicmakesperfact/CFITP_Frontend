import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useUIStore } from "../../app/store/uiStore.js";
import mockIssues from "../../api/mockIssues.js";
import IssueCard from "../../components/Issues/IssueCard.jsx";

export default function IssuesPage() {
  const { userRole } = useUIStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => mockIssues.list(),
  });

  const issues = data?.data || [];

  // ROLE FILTERING
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");

  const filteredIssues = (() => {
    if (userRole === "client") {
      return issues.filter((i) => i.created_by === user.email);
    }
    if (userRole === "staff") {
      return issues.filter((i) => i.assignee_email === user.email);
    }
    return issues; // manager, admin => see all
  })();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Issues</h1>

        {/* CLIENT → Create issue */}
        {userRole === "client" && (
          <button
            onClick={() => navigate("/issues/new")}
            className="bg-[#0EA5A4] hover:bg-[#0c8a89] text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md"
          >
            <Plus size={20} /> New Issue
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {isLoading ? (
        <p className="text-center py-20 text-slate-500">Loading issues...</p>
      ) : filteredIssues.length === 0 ? (
        <p className="text-center py-20 text-slate-500">
          No issues found for your role.
        </p>
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
