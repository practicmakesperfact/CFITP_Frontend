import { useState } from "react";

export default function IssueStatusActions({ issue, onChange }) {
  const [loading, setLoading] = useState(false);

  const handle = async (nextStatus) => {
    setLoading(true);
    try {
      await onChange(nextStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Normalize status for comparison (handle both "in_progress" and "in-progress")
  const normalizedStatus = issue.status?.replace("-", "_");
  
  if (normalizedStatus === "open") {
    return (
      <button
        onClick={() => handle("in_progress")} 
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-[#0EA5A4] text-white"
      >
        Start Work
      </button>
    );
  }

  if (normalizedStatus === "in_progress") {
    
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handle("resolved")}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white"
        >
          Mark Resolved
        </button>
        <button
          onClick={() => handle("closed")}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gray-600 text-white"
        >
          Close
        </button>
      </div>
    );
  }

  
  return (
    <button
      onClick={() => handle("open")}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
    >
      Reopen
    </button>
  );
}
