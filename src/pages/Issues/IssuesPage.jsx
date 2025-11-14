// import { useQuery } from "@tanstack/react-query";
// import { issuesApi } from "../../api/issuesApi.js";
// import { Bug, Search, Plus } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function IssuesPage() {
//   const { data: issues, isLoading } = useQuery({
//     queryKey: ["issues"],
//     queryFn: () => issuesApi.list(),
//   });

//   return (
//     <div className="max-w-7xl mx-auto">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-3xl font-bold">Issues</h1>
//         <Link to="/issues/new" className="btn-primary flex items-center gap-2">
//           <Plus className="h-4 w-4" />
//           New Issue
//         </Link>
//       </div>

//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
//         <div className="p-6 border-b">
//           <div className="flex gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search issues..."
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="text-left p-4 font-medium">Title</th>
//                 <th className="text-left p-4 font-medium">Status</th>
//                 <th className="text-left p-4 font-medium">Priority</th>
//                 <th className="text-left p-4 font-medium">Assignee</th>
//               </tr>
//             </thead>
//             <tbody>
//               {isLoading ? (
//                 <tr>
//                   <td colSpan="4" className="text-center p-8">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : (
//                 issues?.data?.map((issue) => (
//                   <tr
//                     key={issue.id}
//                     className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
//                   >
//                     <td className="p-4">
//                       <Link
//                         to={`/issues/${issue.id}`}
//                         className="text-primary hover:underline"
//                       >
//                         #{issue.id} {issue.title}
//                       </Link>
//                     </td>
//                     <td className="p-4">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           issue.status === "open"
//                             ? "bg-orange-100 text-orange-700"
//                             : issue.status === "in_progress"
//                             ? "bg-blue-100 text-blue-700"
//                             : "bg-green-100 text-green-700"
//                         }`}
//                       >
//                         {issue.status}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           issue.priority === "critical"
//                             ? "bg-red-100 text-red-700"
//                             : issue.priority === "high"
//                             ? "bg-orange-100 text-orange-700"
//                             : "bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         {issue.priority}
//                       </span>
//                     </td>
//                     <td className="p-4">{issue.assignee || "Unassigned"}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/pages/Issues/IssuesPage.jsx
import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

const mockIssues = [
  { id: 1, title: "Login not working", status: "open", priority: "high", created: "2 hours ago" },
  { id: 2, title: "Dashboard slow", status: "in-progress", priority: "medium", created: "1 day ago" },
  { id: 3, title: "Add dark mode", status: "closed", priority: "low", created: "3 days ago" },
];

export default function IssuesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">Issues</h1>
        <button className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Issue
        </button>
      </div>

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

      <div className="grid gap-4">
        {mockIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">{issue.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  issue.status === "open"
                    ? "bg-green-100 text-green-800"
                    : issue.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {issue.status}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                Priority: <span className="font-medium text-text">{issue.priority}</span>
              </span>
              <span>•</span>
              <span>{issue.created}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}