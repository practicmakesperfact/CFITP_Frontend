import { User, Lock, Edit, Trash2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useState } from "react";
import Button from "../UI/Button.jsx";

// Basic mention highlighter: turns @word into highlighted span
function highlightMentions(text) {
  if (!text) return "";
  // escape HTML chars first to avoid injecting markup
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return escaped.replace(
    /@([\w.-]+)/g,
    '<span class="text-teal-600 font-medium">@$1</span>'
  );
}

export default function CommentThread({
  comment,
  userRole,
  currentUser,
  onEdit,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || "");

  const isInternal = comment.visibility === "internal";
  const canViewInternal = ["manager", "admin", "staff"].includes(userRole);

  // Don't show internal comments to clients
  if (isInternal && !canViewInternal) {
    return null;
  }

  // Get author info with fallbacks
  const author = comment.author || {};
  const displayName =
    author.name ||
    author.email ||
    comment.author_name ||
    comment.author_email ||
    "Unknown";
  const authorEmail = author.email || comment.author_email || "";
  const authorRole = author.role || comment.author_role || "unknown";

  // Get initials safely
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const trimmed = name.trim();
    if (trimmed === "") return "U";
    return trimmed
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(displayName);

  // Check if current user is the comment author
  const isAuthor =
    currentUser?.email === authorEmail ||
    currentUser?.id === author?.id ||
    (currentUser?.email &&
      comment.author_email &&
      currentUser.email === comment.author_email);

  // Create HTML with mentions highlighted, then sanitize
  const html = DOMPurify.sanitize(highlightMentions(comment.content || ""));

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content || "");
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg ${
        isInternal ? "bg-yellow-50 border-l-4 border-yellow-400" : "bg-gray-50"
      } ${isAuthor ? "border border-teal-100" : ""}`}
    >
      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{displayName}</span>

            {isAuthor && (
              <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded">
                You
              </span>
            )}

            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
              {authorRole.charAt(0).toUpperCase() + authorRole.slice(1)}
            </span>

            {isInternal && (
              <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                <Lock size={10} /> Internal Note
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </span>

            {isAuthor && !isEditing && (
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-teal-600 p-1"
                  title="Edit comment"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                  title="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
              >
                Save
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
