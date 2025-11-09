import { useState } from "react";
import { reportsApi } from "../../api/reportsApi.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [reportId, setReportId] = useState(null);

  const mutation = useMutation({
    mutationFn: () => reportsApi.request({ type: "issues_by_status" }),
    onSuccess: (res) => {
      setReportId(res.data.id);
      toast.success("Report generation started...");
    },
  });

  const { data: report } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => reportsApi.get(reportId),
    enabled: !!reportId,
    refetchInterval: (data) =>
      data?.data?.status === "completed" ? false : 3000,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Reports</h1>
      <button onClick={() => mutation.mutate()} className="btn-primary mb-6">
        Generate PDF Report
      </button>

      {report && report.data.status === "completed" && (
        <a href={report.data.result_path} download className="ml-4 btn-primary">
          Download PDF
        </a>
      )}
      {report && report.data.status === "processing" && (
        <p>Generating PDF... (this may take a minute)</p>
      )}
    </div>
  );
}
