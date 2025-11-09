import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issuesApi, commentsApi, attachmentsApi } from "../../api";
import CommentThread from "../../components/Comments/CommentThread.jsx";
import CommentEditor from "../../components/Comments/CommentEditor.jsx";
import FileUploader from "../../components/UI/FileUploader.jsx";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function IssueDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: issue } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => issuesApi.retrieve(id),
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentsApi.list(id),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) =>
      attachmentsApi.upload(file, (progress) => {
        console.log("Upload progress:", progress.loaded / progress.total);
      }),
    onSuccess: (res) => {
      toast.success("File uploaded!");
      queryClient.invalidateQueries(["issues", id]);
    },
  });

  if (!issue) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4">
          #{issue.data.id} – {issue.data.title}
        </h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>
            Status: <strong>{issue.data.status}</strong>
          </span>
          <span>
            Priority: <strong>{issue.data.priority}</strong>
          </span>
          <span>
            Reported: {format(new Date(issue.data.created_at), "MMM dd, yyyy")}
          </span>
        </div>
        <p className="mt-6 text-lg">{issue.data.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          <CommentThread comments={comments?.data} />
          <CommentEditor issueId={id} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Attachments</h3>
          <FileUploader
            onUpload={(file) => uploadMutation.mutate(file)}
            isUploading={uploadMutation.isPending}
          />
          <div className="mt-6 space-y-3">
            {issue.data.attachments?.map((att) => (
              <a
                key={att.id}
                href={attachmentsApi.download(att.id)}
                target="_blank"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                {att.filename}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
