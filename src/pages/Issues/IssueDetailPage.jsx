// src/pages/Issues/IssueDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import mockIssues from "../../api/mockIssues.js";
import CommentThread from "../../components/Comments/CommentThread.jsx";
import CommentEditor from "../../components/Comments/CommentEditor.jsx";
import FileUploader from "../../components/UI/FileUploader.jsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

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
    onSettled: () => setUploading(false),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => mockIssues.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      mockIssues.comments.create(id, {
        content: `**Issue ${issue.status === "open" ? "closed" : "reopened"}**`,
        author: "System",
      });
      queryClient.invalidateQueries(["comments", id]);
    },
  });

  const editMutation = useMutation({
    mutationFn: (data) => mockIssues.update(id, data),
    onSuccess: (response) => {
      // THIS LINE FIXES THE PROBLEM — updates the cache instantly
      queryClient.setQueryData(["issues", id], response);
      setIsEditing(false);
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-slate-500">Loading issue...</div>
    );

  const issue = issueRes?.data;
  const comments = commentsQuery.data?.data || [];

  // Edit mode
  if (isEditing) {
    return (
      <motion.div className="max-w-6xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/issues")}
          className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4] transition mb-6"
        >
          <ArrowLeft size={20} />
          Back to Issues
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
                editMutation.mutate({ title: editTitle, description: editDesc })
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
      {/* Top Bar: Back + Edit */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/issues")}
          className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4] transition"
        >
          <ArrowLeft size={20} />
          Back to Issues
        </button>

        {/* Edit Button */}
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <Edit3 size={18} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* LEFT — MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-8">
          {/* Title + Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl text-slate-800 mb-4">
              {issue.title}
              <span className="text-xl text-slate-500 ml-3">#{issue.id}</span>
            </h1>
            <span
              className={`px-4 py-1.5 rounded-full ${
                issue.status === "open"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {issue.status.replace("-", " ")}
            </span>
          </div>

          {/* Original Issue */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#0EA5A4] rounded-full flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-medium text-slate-800">Admin</span>
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
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-8">
            {[...comments].reverse().map((comment) => (
              <CommentThread key={comment.id} comments={[comment]} />
            ))}
          </div>

          {/* Comment Editor + Close Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <CommentEditor
              issueId={id}
              onPosted={() => queryClient.invalidateQueries(["comments", id])}
            />

            {/* Close/Reopen Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() =>
                  statusMutation.mutate(
                    issue.status === "open" ? "closed" : "open"
                  )
                }
                className={`px-8 py-3 rounded-xl font-medium transition ${
                  issue.status === "open"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {issue.status === "open" ? "Close Issue" : "Reopen Issue"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR — Assignee, Labels, Milestone, Attachments */}
        <div className="lg:col-span-1 space-y-6">
          {/* Assignee */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Assignee
            </h3>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-slate-700">
              <option>No one — assign yourself</option>
              <option>John (Staff)</option>
              <option>Sarah (Developer)</option>
              <option>You</option>
            </select>
          </div>

          {/* Labels */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Labels
            </h3>
            <p className="text-slate-500 text-sm">None yet</p>
            <button className="mt-3 text-[#0EA5A4] text-sm hover:underline font-medium">
              Add label
            </button>
          </div>

          {/* Milestone */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Milestone
            </h3>
            <p className="text-slate-500 text-sm">No milestone</p>
            <button className="mt-3 text-[#0EA5A4] text-sm hover:underline font-medium">
              Set milestone
            </button>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl text-slate-800">Attachments</h3>
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
