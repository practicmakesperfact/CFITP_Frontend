import { useState } from "react";
import { Send, Lock, Globe } from "lucide-react";
import Button from "../UI/Button.jsx";

export default function CommentEditor({
  issueId,
  onPost,
  visibility = "public",
  onVisibilityChange,
  isSubmitting = false,
}) {
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await onPost(comment);
      setComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment... Use @ to mention someone"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isSubmitting}
        />

        {/* Visibility toggle for staff/managers */}
        {onVisibilityChange && (
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={() =>
                onVisibilityChange(
                  visibility === "public" ? "internal" : "public"
                )
              }
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                visibility === "internal"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
            >
              {visibility === "internal" ? (
                <>
                  <Lock size={10} /> Internal
                </>
              ) : (
                <>
                  <Globe size={10} /> Public
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {visibility === "internal"
            ? "This comment will only be visible to staff and managers"
            : "This comment will be visible to everyone"}
        </p>

        <Button
          type="submit"
          variant="primary"
          disabled={!comment.trim() || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
          <Send size={16} />
        </Button>
      </div>
    </form>
  );
}
