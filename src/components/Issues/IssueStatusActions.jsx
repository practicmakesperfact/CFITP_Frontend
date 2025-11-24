
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

  // Render button(s) depending on current issue.status
  if (issue.status === "open") {
    return (
      <button
        onClick={() => handle("in-progress")}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-[#0EA5A4] text-white"
      >
        Start Work
      </button>
    );
  }

  if (issue.status === "in-progress") {
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

  // resolved / closed — allow reopen
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
