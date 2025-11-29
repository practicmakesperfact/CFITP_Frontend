
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { issuesApi } from "../../api/issuesApi.js";
import { commentsApi } from "../../api/commentsApi.js";

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

  const { userRole } = useUIStore();

  const { data: issueRes, isLoading } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => issuesApi.retrieve(id).then(res => res.data),
    keepPreviousData: true,
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentsApi.list(id).then(res => res.data),
  });

  
  const uploadMutation = useMutation({
    mutationFn: ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);
      return axiosClient.post(`/issues/${id}/attachments/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      toast.success("Attachment uploaded");
    },
    onSettled: () => setUploading(false),
  });


  const statusMutation = useMutation({
    mutationFn: (status) => issuesApi.transition(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
    },
  });

  
  const assignMutation = useMutation({
    mutationFn: (data) => issuesApi.assign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      toast.success("Assigned successfully");
      setAssignOpen(false);
    },
  });

  
  const editMutation = useMutation({
    mutationFn: (data) => issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      setIsEditing(false);
      toast.success("Issue updated");
    },
  });

  if (isLoading) return <div className="text-center py-20 text-slate-500">Loading issue...</div>;

  const issue = issueRes;
  const comments = commentsQuery.data || [];

  // Edit mode (unchanged)
  if (isEditing) {
    return (
      <motion.div className="max-w-6xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4] mb-6">
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
              onClick={() => editMutation.mutate({ title: editTitle || issue.title, description: editDesc || issue.description })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Save Changes
            </button>
            <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl border border-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-7xl mx-auto pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4]">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="flex items-center gap-3">
          {(() => {
            const user = JSON.parse(localStorage.getItem("user_profile") || "{}");
            const isCreator = user.email === issue.created_by;
            if (["manager", "admin"].includes(userRole) || isCreator) {
              return (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditTitle(issue.title);
                    setEditDesc(issue.description);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit3 size={18} /> Edit
                </button>
              );
            }
          })()}

          {userRole === "manager" && (
            <button onClick={() => setAssignOpen(true)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Assign Staff
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-8">
          {/* Title + Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl text-slate-800 mb-1">
                  {issue.title} <span className="text-xl text-slate-500 ml-3">#{issue.id}</span>
                </h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm ${
                    issue.status === "open" ? "bg-emerald-100 text-emerald-700" :
                    issue.status === "in-progress" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {issue.status.replace("-", " ")}
                  </span>
                  <span className="text-sm text-slate-500">Opened by {issue.created_by_name}</span>
                </div>
              </div>
              {userRole === "staff" && <IssueStatusActions issue={issue} onChange={(s) => statusMutation.mutate(s)} />}
            </div>
          </div>

          {/* Original Post */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#0EA5A4] rounded-full flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-medium text-slate-800">{issue.created_by_name}</span>
                  <span className="text-sm text-slate-500">
                    opened on {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
                {issue.attachments?.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {issue.attachments.map((att) => (
                      <a key={att.id} href={att.url} target="_blank" rel="noreferrer"
                        className="block p-3 bg-gray-50 rounded-lg border text-sm text-[#0EA5A4] hover:bg-gray-100 text-center">
                        {att.filename}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-8">
            {[...comments].reverse().map((c) => (
              <CommentThread key={c.id} comments={[c]} />
            ))}
          </div>

          {/* Comment Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <CommentEditor
              issueId={id}
              onPosted={() => queryClient.invalidateQueries(["comments", id])}
            />

            {userRole === "client" && (
              <div className="mt-6 text-right">
                <button
                  onClick={() => statusMutation.mutate(issue.status === "open" ? "closed" : "open")}
                  className={`px-6 py-3 rounded-xl font-medium ${
                    issue.status === "open" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {issue.status === "open" ? "Close Issue" : "Reopen Issue"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* Assignee */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Assignee</h3>
            {issue.assignee_name ? (
              <div className="text-sm">
                <div className="font-medium">{issue.assignee_name}</div>
                <div className="text-xs text-slate-500">{issue.assignee_email}</div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No one assigned</p>
            )}
            {userRole === "manager" && (
              <button onClick={() => setAssignOpen(true)} className="mt-4 w-full text-sm px-4 py-2 border rounded-lg hover:bg-gray-50">
                Assign / Reassign
              </button>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Attachments</h3>
            <FileUploader
              onUpload={(file) => {
                setUploading(true);
                uploadMutation.mutate({ file });
              }}
              isUploading={uploading}
            />

            <div className="mt-6 space-y-3">
              {(issue.attachments || []).length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8">No attachments yet</p>
              ) : (
                issue.attachments.map((att) => (
                  <div key={att.id} className="p-4 bg-gray-50 rounded-lg border">
                    <a href={att.url} target="_blank" rel="noreferrer"
                      className="text-[#0EA5A4] hover:underline flex items-center gap-2 text-sm">
                      {att.filename}
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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