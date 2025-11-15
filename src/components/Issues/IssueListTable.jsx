import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "../../api/issuesApi.js";
import IssueCard from "../../components/Issues/IssueCard.jsx";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function IssueListTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issuesApi.list(),
  });

  const issues = data?.data || [];

  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            {
              open: "bg-emerald-100 text-emerald-700",
              "in-progress": "bg-yellow-100 text-yellow-700",
              closed: "bg-gray-200 text-gray-700",
            }[row.original.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            {
              low: "bg-slate-100 text-slate-700",
              medium: "bg-orange-100 text-orange-700",
              high: "bg-red-100 text-red-700",
              critical: "bg-red-200 text-red-800 font-semibold",
            }[row.original.priority] || "bg-gray-100 text-gray-700"
          }`}
        >
          {row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-gray-500 text-sm">
          {format(new Date(row.original.created_at), "MMM dd, yyyy")}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: issues,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {/* MOBILE VIEW → CARD LAYOUT */}
      <div className="md:hidden grid gap-4">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>

      {/* DESKTOP VIEW → TABLE */}
      <div className="hidden md:block overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700/30 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-4 px-5 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.04)" }}
                className="transition cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-4 px-5 border-b text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
