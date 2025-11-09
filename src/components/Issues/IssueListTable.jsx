import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "../../api/issuesApi.js";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";

export default function IssueListTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issuesApi.list(),
  });

  const columns = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "priority", header: "Priority" },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "MMM dd, yyyy"),
    },
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-left py-3 px-4 border-b">
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
          <tr key={row.id} className="hover:bg-gray-50">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="py-3 px-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
