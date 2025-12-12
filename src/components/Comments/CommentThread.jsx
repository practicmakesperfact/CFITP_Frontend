import { User, Lock, Edit, Trash2, Paperclip, Download, Image as ImageIcon } from "lucide-react";
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
    /@([\w.-]+@[\w.-]+\.\w+|[\w.-]+)/g,
    '<span class="text-teal-600 font-medium hover:underline cursor-pointer">@$1</span>'
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
    author.get_full_name?.() ||
    `${author.first_name || ""} ${author.last_name || ""}`.trim() ||
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
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div
      className={`flex gap-4 p-4 rounded-lg border ${
        isInternal
          ? "bg-yellow-50 border-yellow-200"
          : "bg-white border-gray-200"
      } ${isAuthor ? "border-teal-300 bg-teal-50/30" : ""}`}
    >
      {/* Left: Profile Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
      </div>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{displayName}</span>

            {isAuthor && (
              <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
                You
              </span>
            )}

            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
              {authorRole}
            </span>

            {isInternal && (
              <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                <Lock size={10} /> Internal
              </span>
            )}

            <span className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Right: Edit/Delete buttons */}
          {isAuthor && !isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-teal-600 p-1.5 rounded hover:bg-teal-50 transition"
                title="Edit comment"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this comment?")) {
                    onDelete(comment.id);
                  }
                }}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition"
                title="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={4}
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
          <>
            <div
              className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap mb-2"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {/* Comment attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {comment.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.file || att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Paperclip size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{att.filename || att.file?.split("/").pop()}</span>
                    <Download size={12} className="text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
