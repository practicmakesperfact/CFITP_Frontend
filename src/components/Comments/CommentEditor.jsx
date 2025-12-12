import { useState, useRef, useEffect } from "react";
import { Send, Lock, Globe, Paperclip, X, Image as ImageIcon } from "lucide-react";
import Button from "../UI/Button.jsx";
import axiosClient from "../../api/axiosClient.js";
import { attachmentsApi } from "../../api/attachmentsApi.js";

export default function CommentEditor({
  issueId,
  onPost,
  visibility = "public",
  onVisibilityChange,
  isSubmitting = false,
  onMentionSearch,
  mentionedUsers = [],
}) {
  const [comment, setComment] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);

  // Handle @mention detection
  useEffect(() => {
    const handleInput = (e) => {
      const text = e.target.value;
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = text.substring(0, cursorPos);
      const match = textBeforeCursor.match(/@(\w*)$/);

      if (match) {
        setMentionQuery(match[1]);
        const rect = e.target.getBoundingClientRect();
        setMentionPosition({
          top: rect.top + rect.height,
          left: rect.left,
        });
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("input", handleInput);
      textarea.addEventListener("keydown", (e) => {
        if (showMentions && e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (mentionedUsers.length > 0) {
            insertMention(mentionedUsers[0]);
          }
        }
      });
      return () => {
        textarea.removeEventListener("input", handleInput);
      };
    }
  }, [showMentions, mentionedUsers]);

  const insertMention = (user) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);
    
    if (match) {
      const start = cursorPos - match[0].length;
      const newText = 
        text.substring(0, start) + 
        `@${user.email} ` + 
        text.substring(cursorPos);
      setComment(newText);
      setShowMentions(false);
      textarea.focus();
      textarea.setSelectionRange(start + user.email.length + 2, start + user.email.length + 2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await onPost(comment, []); // No attachments from comment editor
      setComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment... Use @ to mention someone"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          rows={4}
          disabled={isSubmitting}
        />

        {/* Mention dropdown */}
        {showMentions && mentionedUsers.length > 0 && (
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            style={{
              top: `${mentionPosition.top}px`,
              left: `${mentionPosition.left}px`,
            }}
          >
            {mentionedUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => insertMention(user)}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Visibility toggle */}
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

      {/* Attachments preview */}
      {/* Removed attachments preview as attachments are now handled by the backend */}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* REMOVE the file input and attach button - attachments should only be uploaded via sidebar */}
          <p className="text-xs text-gray-500">
            {visibility === "internal"
              ? "Internal note (staff/manager only)"
              : "Public comment"}
          </p>
        </div>

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
