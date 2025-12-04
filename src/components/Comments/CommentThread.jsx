
import { User, Lock } from "lucide-react";
import DOMPurify from "dompurify";

export default function CommentThread({ comment, userRole }) {
  const isInternal = comment.visibility === "internal";
  const canViewInternal = ["manager", "admin", "staff"].includes(userRole);

  // Don't show internal comments to clients
  if (isInternal && !canViewInternal) {
    return null;
  }

  const sanitizedContent = DOMPurify.sanitize(comment.content);

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg ${
        isInternal ? "bg-yellow-50 border-l-4 border-yellow-400" : "bg-gray-50"
      }`}
    >
      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
        {comment.author_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "U"}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {comment.author_name || comment.author_email}
            </span>

            {isInternal && (
              <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                <Lock size={10} /> Internal Note
              </span>
            )}
          </div>

          <span className="text-sm text-gray-500">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        <div
          className="prose prose-gray max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  );
}
