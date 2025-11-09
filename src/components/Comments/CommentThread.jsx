import { format } from "date-fns";
import DOMPurify from "dompurify";

export default function CommentThread({ comments }) {
  return (
    <div className="space-y-6">
      {comments?.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {comment.author[0]}
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{comment.author}</span>
                <span className="text-sm text-gray-500">
                  {format(new Date(comment.created_at), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(comment.content),
                }}
                className="prose prose-sm"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
