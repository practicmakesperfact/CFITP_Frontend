
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../../api/commentsApi.js"; 
import toast from "react-hot-toast";

export default function CommentEditor({ issueId, onPosted }) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => commentsApi.create(issueId, data), 
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", issueId]);
      setContent("");
      setFiles([]);
      onPosted?.();
      toast.success("Comment posted!");
    },
    onError: () => {
      toast.error("Failed to post comment");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    const authorProfile = JSON.parse(
      localStorage.getItem("user_profile") || "{}"
    );
    const author = authorProfile.first_name
      ? `${authorProfile.first_name} ${authorProfile.last_name || ""}`.trim()
      : authorProfile.email || "You";

    // Convert files to FormData for real backend
    const formData = new FormData();
    formData.append("content", content || "(attached files)");
    formData.append("author", author);

    files.forEach((file) => {
      formData.append("attachments", file);
    });

    mutation.mutate(formData);
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

      {/* FILE UPLOAD — using native input (you can keep FileUploader if you want) */}
      <div className="mt-3">
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files))}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0EA5A4] file:text-white hover:file:bg-teal-700"
        />
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
              mutation.isPending || (!content.trim() && files.length === 0)
            }
            className="bg-[#0EA5A4] hover:bg-[#0c9d95] disabled:bg-gray-300 text-white px-5 py-2 rounded-xl"
          >
            {mutation.isPending ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}
