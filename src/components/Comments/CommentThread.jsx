
import { format } from "date-fns";

export default function CommentThread({ comments = [] }) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No comments yet. Be the first to reply!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 bg-[#0EA5A4] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {comment.author[0].toUpperCase()}
          </div>

          {/* Comment Bubble - Light & Clean */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-medium text-slate-800">
                  {comment.author}
                </span>
                <span className="text-sm text-slate-500">
                  {format(
                    new Date(comment.created_at),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
