import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "../../api/issuesApi.js";
import { Bug, Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function IssuesPage() {
  const { data: issues, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issuesApi.list(),
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Issues</h1>
        <Link to="/issues/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Issue
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left p-4 font-medium">Title</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Priority</th>
                <th className="text-left p-4 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center p-8">
                    Loading...
                  </td>
                </tr>
              ) : (
                issues?.data?.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-4">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="text-primary hover:underline"
                      >
                        #{issue.id} {issue.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          issue.status === "open"
                            ? "bg-orange-100 text-orange-700"
                            : issue.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          issue.priority === "critical"
                            ? "bg-red-100 text-red-700"
                            : issue.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </td>
                    <td className="p-4">{issue.assignee || "Unassigned"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
