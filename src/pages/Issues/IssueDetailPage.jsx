
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import mockIssues from "../../api/mockIssues.js";
import CommentThread from "../../components/Comments/CommentThread.jsx";
import CommentEditor from "../../components/Comments/CommentEditor.jsx";
import FileUploader from "../../components/UI/FileUploader.jsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useUIStore } from "../../app/store/uiStore.js";
import AssignModal from "../../components/Issues/AssignModal.jsx";
import IssueStatusActions from "../../components/Issues/IssueStatusActions.jsx";
import toast from "react-hot-toast";

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  const { userRole, setUserRole } = useUIStore();

  const { data: issueRes, isLoading } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => mockIssues.retrieve(id),
    keepPreviousData: true,
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", id],
    queryFn: () => mockIssues.comments.list(id),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ issueId, file }) =>
      mockIssues.attachments.upload(issueId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      queryClient.invalidateQueries(["comments", id]);
      toast.success("Attachment uploaded");
    },
    onSettled: () => setUploading(false),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => mockIssues.transition(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      queryClient.invalidateQueries(["comments", id]);
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ assignee_name, assignee_email }) =>
      mockIssues.assign(id, { assignee_name, assignee_email }),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      queryClient.invalidateQueries(["issues"]);
      toast.success("Assigned successfully");
      setAssignOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: (data) => mockIssues.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["issues", id]);
      setIsEditing(false);
      toast.success("Issue updated");
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-slate-500">Loading issue...</div>
    );

  const issue = issueRes?.data;
  const comments = commentsQuery.data?.data || [];

  // Edit mode UI
  if (isEditing) {
    return (
      <motion.div className="max-w-6xl mx-auto space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4] transition mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <input
            value={editTitle || issue.title}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-3xl font-medium text-slate-800 mb-6 border-b-2 border-[#0EA5A4] pb-2 focus:outline-none"
          />
          <textarea
            value={editDesc || issue.description}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={10}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] resize-none"
          />
          <div className="mt-6 flex gap-3">
            <button
              onClick={() =>
                editMutation.mutate({
                  title: editTitle || issue.title,
                  description: editDesc || issue.description,
                })
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-xl border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-7xl mx-auto pb-20">
      {/* Top Bar: Back + Role-specific controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4] transition"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="flex items-center gap-3">
          {/* Edit allowed to creator or manager/admin */}
          {(() => {
            const user = JSON.parse(
              localStorage.getItem("user_profile") || "{}"
            );
            const isCreator = user.email === issue.created_by;
            if (userRole === "manager" || userRole === "admin" || isCreator) {
              return (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditTitle(issue.title);
                    setEditDesc(issue.description);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Edit3 size={18} /> Edit
                </button>
              );
            }
            return null;
          })()}

          {/* Manager: Open Assign modal */}
          {userRole === "manager" && (
            <button
              onClick={() => setAssignOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Assign Staff
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* LEFT — MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-8">
          {/* Title + Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl text-slate-800 mb-1">
                  {issue.title}{" "}
                  <span className="text-xl text-slate-500 ml-3">
                    #{issue.id}
                  </span>
                </h1>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      issue.status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : issue.status === "in-progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {issue.status.replace("-", " ")}
                  </span>
                  <span className="text-sm text-slate-500">
                    Opened by {issue.created_by_name}
                  </span>
                </div>
              </div>

              {/* Staff-only status actions */}
              {userRole === "staff" && (
                <IssueStatusActions
                  issue={issue}
                  onChange={(s) => statusMutation.mutate(s)}
                />
              )}
            </div>
          </div>

          {/* Original Issue  */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#0EA5A4] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  C
                  </div>
                  <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-medium text-slate-800">
                    {issue.created_by_name}
                    </span>
                    <span className="text-sm text-slate-500">
                    opened this issue on{" "}
                    {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {issue.description}
                    </p>
                  </div>

                  {/* attachments inline */}
                  {issue.attachments && issue.attachments.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-3">
                    {issue.attachments.map((att) => (
                      <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-[#0EA5A4] hover:bg-gray-100"
                      >
                      {att.filename || `attachment-${att.id}`}
                      </a>
                    ))}
                    </div>
                  )}
                  </div>
                </div>
                </div>

                {/* Comments */}
          <div className="space-y-8">
            {[...comments].reverse().map((comment) => (
              <CommentThread key={comment.id} comments={[comment]} />
            ))}
          </div>

          {/* Comment Editor + Status (client can close/reopen) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <CommentEditor
              issueId={id}
              onPosted={() => queryClient.invalidateQueries(["comments", id])}
            />

            <div className="mt-6 flex justify-between items-center">
              {/* Client: close / reopen */}
              {userRole === "client" && (
                <button
                  onClick={() =>
                    statusMutation.mutate(
                      issue.status === "open" ? "closed" : "open"
                    )
                  }
                  className={`px-6 py-3 rounded-xl font-medium transition ${
                    issue.status === "open"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {issue.status === "open" ? "Close Issue" : "Reopen Issue"}
                </button>
              )}

              {/* placeholder for right aligned small hint */}
              <div className="text-sm text-slate-500">
                Comments are public to issue participants. Use @ to mention.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          {/* Assignee */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Assignee
            </h3>
            <div className="text-sm text-slate-600">
              {issue.assignee_name ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{issue.assignee_name}</div>
                    <div className="text-xs text-slate-500">
                      {issue.assignee_email}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">Assigned</div>
                </div>
              ) : (
                <div className="text-slate-500">No one assigned</div>
              )}
            </div>
            {userRole === "manager" && (
              <button
                onClick={() => setAssignOpen(true)}
                className="mt-4 w-full px-4 py-2 rounded-xl border border-gray-300 text-sm"
              >
                Assign / Reassign
              </button>
            )}
          </div>

          {/* Labels */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Labels
            </h3>
            <p className="text-slate-500 text-sm">None yet</p>
          </div>

          {/* Milestone */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Milestone
            </h3>
            <p className="text-slate-500 text-sm">No milestone</p>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl text-slate-800">Attachments</h3>
            <FileUploader
              onUpload={(file) => {
                setUploading(true);
                uploadMutation.mutate({ issueId: id, file });
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

      {/* Assign Modal */}
      {assignOpen && (
        <AssignModal
          issue={issue}
          onClose={() => setAssignOpen(false)}
          onAssign={(assignee) => assignMutation.mutate(assignee)}
        />
      )}
    </motion.div>
  );
}
