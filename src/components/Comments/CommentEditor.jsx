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
        className="w-full p-4 border rounded-lg"
        rows="4"
      />
      <button onClick={handleSubmit} className="btn-primary mt-2">
        Post Comment
      </button>
    </div>
  );
}
