import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../../api/commentsApi.js";

export default function CommentEditor({ issueId }) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => commentsApi.create(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", issueId]);
      setContent("");
    },
  });

  const handleSubmit = () => {
    if (content.trim()) {
      mutation.mutate({ content });
    }
  };

  return (
    <div className="mt-8">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type @ to mention someone..."
        className="w-full p-4 border rounded-lg outline-none"
        rows="4"
      />
      <button
        type="submit"
        className="mt-4 bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white px-6 py-3 rounded-xl transition font-medium"
      >
        Post Comment
      </button>
    </div>
  );
}
