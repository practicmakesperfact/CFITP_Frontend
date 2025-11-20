// // src/pages/Issues/IssuesPage.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { Search, Plus, Filter } from "lucide-react";
// import { motion } from "framer-motion";
// import { formatDistanceToNow } from "date-fns";
// import { useUIStore } from "../../app/store/uiStore.js";
// import mockIssues from "../../api/mockIssues.js";

// export default function IssuesPage() {
//   const navigate = useNavigate();
//   const { userRole } = useUIStore();
//   const [search, setSearch] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterPriority, setFilterPriority] = useState("all");

//   const { data: issuesData, isLoading } = useQuery({
//     queryKey: ["issues"],
//     queryFn: mockIssues.list,
//   });

//   const allIssues = issuesData?.data || [];

//   // Filter issues based on role
//   const issues =
//     userRole === "client"
//       ? allIssues.filter((i) => i.created_by === "client@cfitp.com") // or use real user email later
//       : allIssues;

//   // Apply filters
//   const filteredIssues = issues.filter((issue) => {
//     const matchesSearch =
//       issue.title.toLowerCase().includes(search.toLowerCase()) ||
//       issue.description.toLowerCase().includes(search.toLowerCase());
//     const matchesStatus =
//       filterStatus === "all" || issue.status === filterStatus;
//     const matchesPriority =
//       filterPriority === "all" || issue.priority === filterPriority;
//     return matchesSearch && matchesStatus && matchesPriority;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "open":
//         return "bg-red-100 text-red-700";
//       case "in-progress":
//         return "bg-amber-100 text-amber-700";
//       case "resolved":
//       case "closed":
//         return "bg-emerald-100 text-emerald-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case "high":
//       case "critical":
//         return "bg-red-100 text-red-700";
//       case "medium":
//         return "bg-orange-100 text-orange-700";
//       case "low":
//         return "bg-blue-100 text-blue-700";
//       default:
//         return "bg-gray-100 text-gray-600";
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="max-w-7xl mx-auto space-y-8"
//     >
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-4xl font-bold text-slate-800">
//             {userRole === "client" ? "My Issues" : "All Issues"}
//           </h1>
//           <p className="text-slate-600 mt-2">
//             {filteredIssues.length}{" "}
//             {filteredIssues.length === 1 ? "issue" : "issues"} found
//           </p>
//         </div>

//         {/* New Issue Button - ONLY FOR CLIENT */}
//         {userRole === "client" && (
//           <button
//             onClick={() => navigate("/issues/new")}
//             className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl transition transform hover:scale-105 font-semibold text-lg"
//           >
//             <Plus size={24} />
//             New Issue
//           </button>
//         )}
//       </div>

//       {/* Search & Filters */}
//       <div className="flex flex-col lg:flex-row gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-4 top-4 text-gray-400" size={22} />
//           <input
//             type="text"
//             placeholder="Search issues by title or description..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-[#0EA5A4] focus:ring-4 focus:ring-teal-100 outline-none text-lg transition"
//           />
//         </div>

//         <div className="flex gap-3">
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-[#0EA5A4] outline-none transition"
//           >
//             <option value="all">All Status</option>
//             <option value="open">Open</option>
//             <option value="in-progress">In Progress</option>
//             <option value="resolved">Resolved</option>
//           </select>

//           <select
//             value={filterPriority}
//             onChange={(e) => setFilterPriority(e.target.value)}
//             className="px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-[#0EA5A4] outline-none transition"
//           >
//             <option value="all">All Priority</option>
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//             <option value="critical">Critical</option>
//           </select>
//         </div>
//       </div>

//       {/* Loading */}
//       {isLoading && (
//         <div className="text-center py-20">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0EA5A4] border-t-transparent"></div>
//         </div>
//       )}

//       {/* Issues Grid */}
//       {!isLoading && filteredIssues.length === 0 ? (
//         <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
//           <div className="text-6xl mb-6">Empty</div>
//           <p className="text-xl text-slate-600">
//             {search || filterStatus !== "all" || filterPriority !== "all"
//               ? "No issues match your filters"
//               : userRole === "client"
//               ? "You haven't created any issues yet"
//               : "No issues in the system"}
//           </p>
//           {userRole === "client" && !search && (
//             <button
//               onClick={() => navigate("/issues/new")}
//               className="mt-6 bg-[#0EA5A4] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#0d8c8b] transition"
//             >
//               Create Your First Issue
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//           {filteredIssues.map((issue) => (
//             <motion.div
//               key={issue.id}
//               whileHover={{ y: -4 }}
//               onClick={() => navigate(`/issues/${issue.id}`)}
//               className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-2xl"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-xl font-bold text-slate-800 line-clamp-2">
//                   {issue.title}
//                 </h3>
//                 <span
//                   className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPriorityColor(
//                     issue.priority
//                   )}`}
//                 >
//                   {issue.priority.toUpperCase()}
//                 </span>
//               </div>

//               <p className="text-slate-600 text-sm line-clamp-3 mb-5">
//                 {issue.description}
//               </p>

//               <div className="flex items-center justify-between">
//                 <span
//                   className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
//                     issue.status
//                   )}`}
//                 >
//                   {issue.status.replace("-", " ").toUpperCase()}
//                 </span>
//                 <span className="text-xs text-slate-500">
//                   {formatDistanceToNow(new Date(issue.created_at), {
//                     addSuffix: true,
//                   })}
//                 </span>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </motion.div>
//   );
// }

// src/pages/Issues/IssuesPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useUIStore } from "../../app/store/uiStore.js";
import { issuesApi } from "../../api/issuesApi.js"; // ← SAME AS DASHBOARD

export default function IssuesPage() {
  const navigate = useNavigate();
  const { userRole } = useUIStore();
  const [search, setSearch] = useState("");

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["issues"], // Same cache key → shared data!
    queryFn: () => issuesApi.list(), // SAME API CALL
  });

  const allIssues = issuesData?.data || [];

  // Client sees only their issues
  const issues = userRole === "client"
    ? allIssues.filter(i => i.created_by === "client@cfitp.com") // or real user email
    : allIssues;

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    issue.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-800">
          {userRole === "client" ? "My Issues" : "All Issues"}
        </h1>
        {userRole === "client" && (
          <button
            onClick={() => navigate("/issues/new")}
            className="bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl transition transform hover:scale-105 font-bold"
          >
            <Plus size={26} />
            New Issue
          </button>
        )}
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-4 text-gray-400" size={24} />
        <input
          type="text"
          placeholder="Search issues by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] focus:ring-4 focus:ring-teal-100 outline-none text-lg"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20">Loading issues...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl shadow-lg">
          <p className="text-6xl font-bold text-gray-300 mb-6">Empty</p>
          <p className="text-2xl text-slate-600">
            {userRole === "client" ? "You haven't created any issues yet" : "No issues found"}
          </p>
          {userRole === "client" && (
            <button
              onClick={() => navigate("/issues/new")}
              className="mt-8 bg-[#0EA5A4] text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-[#0d8c8b] transition"
            >
              Create Your First Issue
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredIssues.map((issue) => (
            <motion.div
              key={issue.id}
              whileHover={{ y: -6 }}
              onClick={() => navigate(`/issues/${issue.id}`)}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-slate-800">{issue.title}</h3>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  issue.priority === "high" ? "bg-red-100 text-red-700" :
                  issue.priority === "medium" ? "bg-orange-100 text-orange-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {issue.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-600 mb-6 line-clamp-3">{issue.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-5 py-2 rounded-full font-bold text-sm ${
                  issue.status === "open" ? "bg-red-100 text-red-700" :
                  issue.status === "in-progress" ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {issue.status.replace("-", " ").toUpperCase()}
                </span>
                <span className="text-sm text-slate-500">
                  {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}