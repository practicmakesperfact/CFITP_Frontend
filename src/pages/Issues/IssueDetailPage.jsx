// src/pages/Issues/IssueDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import mockIssues from "../../api/mockIssues.js";
import CommentThread from "../../components/Comments/CommentThread.jsx";
import CommentEditor from "../../components/Comments/CommentEditor.jsx";
import FileUploader from "../../components/UI/FileUploader.jsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: issueRes, isLoading } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => mockIssues.retrieve(id),
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", id],
    queryFn: () => mockIssues.comments.list(id),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ issueId, file }) =>
      mockIssues.attachments.upload(issueId, file),
    onSuccess: () => queryClient.invalidateQueries(["issues", id]),
  });

  if (isLoading) {
    return (
      <div className="text-center py-16 text-slate-500">Loading issue...</div>
    );
  }

  const issue = issueRes?.data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/issues")}
        className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4] transition"
      >
        <ArrowLeft size={20} />
        Back to Issues
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl text-slate-800 mb-4">{issue.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
          <span
            className={`px-4 py-1.5 rounded-full ${
              issue.status === "open"
                ? "bg-emerald-100 text-emerald-700"
                : issue.status === "in-progress"
                ? "bg-amber-100 text-amber-700"
                : issue.status === "closed"
                ? "bg-gray-100 text-gray-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {issue.status.replace("-", " ")}
          </span>
          <span
            className={`px-4 py-1.5 rounded-full ${
              issue.priority === "high"
                ? "bg-red-100 text-red-700"
                : issue.priority === "medium"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {issue.priority}
          </span>
          <span className="text-slate-500">
            Created: {new Date(issue.created_at).toLocaleDateString()} at{" "}
            {new Date(issue.created_at).toLocaleTimeString()}
          </span>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>
      </div>

      {/* Comments + Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl text-slate-800">Comments</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <CommentThread comments={commentsQuery.data?.data || []} />
            <div className="mt-6 outline-none">
              <CommentEditor
                issueId={id}
                onPosted={() => queryClient.invalidateQueries(["comments", id])}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl text-slate-800">Attachments</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FileUploader
              onUpload={(file) => {
                setUploading(true);
                uploadMutation.mutate(
                  { issueId: id, file },
                  { onSettled: () => setUploading(false) }
                );
              }}
              isUploading={uploading}
            />

            <div className="mt-6 space-y-3">
              {(issue.attachments || []).length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  No attachments yet
                </p>
              ) : (
                issue.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <a
                      href={att.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0EA5A4] hover:underline flex items-center gap-2"
                    >
                      📎 {att.filename}
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
