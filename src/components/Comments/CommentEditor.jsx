
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mockIssues from "../../api/mockIssues.js";

export default function CommentEditor({ issueId, onPosted }) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => mockIssues.comments.create(issueId, data),
    onSuccess: () => {
      // invalidate comments for this issue so UI refreshes
      queryClient.invalidateQueries(["comments", issueId]);
      setContent("");
      onPosted?.();
    },
    onSettled: () => {
      // optional: reset mutation state
      mutation.reset();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate({ content, author: "You" });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment…"
        className="w-full p-5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent resize-none"
        rows="4"
      />
      <div className="mt-4 flex justify-between items-center gap-4">
        <div className="text-sm text-slate-500">
          Markdown supported • @mentions
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setContent("");
            }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={mutation.isLoading || !content.trim()}
            className="bg-[#0EA5A4] hover:bg-[#0c9d95] disabled:bg-gray-300 text-white px-5 py-2 rounded-xl"
          >
            {mutation.isLoading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}
