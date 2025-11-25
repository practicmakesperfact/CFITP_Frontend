
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mockIssues from "../../api/mockIssues.js";

export default function CommentEditor({ issueId, onPosted }) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => mockIssues.comments.create(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", issueId]);
      setContent("");
      setFiles([]);
      onPosted?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    const authorProfile = JSON.parse(
      localStorage.getItem("user_profile") || "{}"
    );
    const author = authorProfile.first_name || authorProfile.email || "You";

    // attachments: keep as base64 urls (mock)
    Promise.all(
      files.map(async (f) => {
        if (typeof f === "string")
          return { url: f, filename: f.name || "file" };
        const reader = new FileReader();
        const base64 = await new Promise((res, rej) => {
          reader.onload = () => res(reader.result);
          reader.onerror = (err) => rej(err);
          reader.readAsDataURL(f);
        });
        return { url: base64, filename: f.name };
      })
    ).then((attachments) => {
      mutation.mutate({ content, author, attachments });
    });
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
      {/* <div className="mt-3">
        <input
          type="file"
          onChange={(e) => setFiles(Array.from(e.target.files))}
          multiple
        />
        {files.length > 0 && (
          <div className="mt-2 flex gap-2">
            {files.map((f, idx) => (
              <div key={idx} className="p-2 bg-gray-100 rounded-md text-sm">
                {f.name}
              </div>
            ))}
          </div>
        )}
      </div> */}

      <div className="mt-4 flex justify-between items-center gap-4">
        <div className="text-sm text-slate-500">
          Markdown supported • @mentions
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setContent("");
              setFiles([]);
            }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              mutation.isLoading || (!content.trim() && files.length === 0)
            }
            className="bg-[#0EA5A4] hover:bg-[#0c9d95] disabled:bg-gray-300 text-white px-5 py-2 rounded-xl"
          >
            {mutation.isLoading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}
