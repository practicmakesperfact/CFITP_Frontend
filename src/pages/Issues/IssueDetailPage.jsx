import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit3,
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Paperclip,
  Download,
  Globe,
  Tag,
} from "lucide-react";

import { issuesApi } from "../../api/issuesApi.js";
import { commentsApi } from "../../api/commentsApi.js";
import { attachmentsApi } from "../../api/attachmentsApi.js";
import axiosClient from "../../api/axiosClient.js";

import CommentThread from "../../components/Comments/CommentThread.jsx";
import CommentEditor from "../../components/Comments/CommentEditor.jsx";
import FileUploader from "../../components/UI/FileUploader.jsx";
import Button from "../../components/UI/Button.jsx";
import IssueStatusActions from "../../components/Issues/IssueStatusActions.jsx";
import AssignModal from "../../components/Issues/AssignModal.jsx";
import { useUIStore } from "../../app/store/uiStore.js";
import { useAuth } from "../../app/hooks.js";
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
  const [commentVisibility, setCommentVisibility] = useState("public");

  const { userRole } = useUIStore();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  // Get user from localStorage as fallback
  const getLocalUser = () => {
    try {
      const userStr = localStorage.getItem("user_profile");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  const user = currentUser || getLocalUser();

  // Fetch issue details
  const {
    data: issueRes,
    isLoading: issueLoading,
    error: issueError,
  } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => issuesApi.retrieve(id).then((res) => res.data),
    onError: (err) => {
      console.error("Error loading issue:", err);
      toast.error("Failed to load issue details");
    },
    enabled: !!id && !authLoading, // Wait for auth to load
  });

  // Fetch comments
  const {
    data: comments = [],
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ["comments", id],
    queryFn: () =>
      commentsApi.list(id).then((res) => {
        if (Array.isArray(res.data)) {
          return res.data;
        } else if (res.data?.results) {
          return res.data.results;
        }
        return [];
      }),
    onError: (err) => {
      console.error("Error loading comments:", err);
      if (err.response?.status !== 404) {
        toast.error("Failed to load comments");
      }
    },
    enabled: !!id, // Only fetch if we have an issue ID
  });

  // Sort comments by created_at DESC (newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Fetch attachments
  const {
    data: attachments = [],
    isLoading: attachmentsLoading,
    error: attachmentsError,
  } = useQuery({
    queryKey: ["attachments", id],
    queryFn: () =>
      attachmentsApi.list(id).then((res) => {
        if (Array.isArray(res.data)) {
          return res.data;
        } else if (res.data?.results) {
          return res.data.results;
        }
        return [];
      }),
    onError: (err) => {
      console.error("Error loading attachments:", err);
      // Don't show toast for 404, it's expected
    },
    enabled: !!id,
  });

  // Get attachments from issue data as fallback
  const issueAttachments = issueRes?.attachments || [];
  const allAttachments =
    attachments.length > 0 ? attachments : issueAttachments;

  // Fetch staff users for assignment
  const { data: staffUsers = [] } = useQuery({
    queryKey: ["staff-users"],
    queryFn: async () => {
      try {
        const response = await axiosClient.get("/users/");
        const users = response.data.results || response.data || [];
        return users.filter((u) => u.role === "staff" || u.role === "manager");
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
    enabled: userRole === "manager", // Only fetch for managers
  });

  // Helper functions
  const getUserInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const trimmedName = name.trim();
    if (trimmedName === "") return "U";
    const nameParts = trimmedName.split(" ").filter((part) => part.length > 0);
    if (nameParts.length === 0) return "U";
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");
    return initials.slice(0, 2);
  };

  const getDisplayName = (userData) => {
    if (!userData) return "Unknown";
    if (typeof userData === "string") return userData;
    if (typeof userData === "object") {
      if (userData.name) return userData.name;
      if (userData.first_name && userData.last_name) {
        return `${userData.first_name} ${userData.last_name}`;
      }
      if (userData.email) return userData.email;
      if (userData.username) return userData.username;
    }
    return "Unknown";
  };

  const getEmail = (userData) => {
    if (!userData) return "";
    if (typeof userData === "string" && userData.includes("@")) return userData;
    if (typeof userData === "object" && userData.email) {
      return userData.email;
    }
    return "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Mutations
 const uploadMutation = useMutation({
   mutationFn: async (file) => {
     console.log("Uploading file:", file.name);
     setUploading(true);

     // Use the corrected API
     return await attachmentsApi.create(id, file, user?.id);
   },
   onSuccess: () => {
     queryClient.invalidateQueries(["attachments", id]);
     toast.success("File uploaded successfully!");
   },
   onError: (error) => {
     console.error("Upload error details:", {
       status: error.response?.status,
       data: error.response?.data,
       message: error.message,
     });

     if (error.response?.status === 405) {
       toast.error(
         "Method not allowed. Check if endpoint exists and supports POST."
       );
     } else if (error.response?.status === 400) {
       const errorData = error.response.data;
       toast.error(`Upload failed: ${JSON.stringify(errorData)}`);
     } else {
       toast.error("Failed to upload file");
     }
   },
   onSettled: () => setUploading(false),
 });

  const statusMutation = useMutation({
    mutationFn: (status) => issuesApi.transition(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      toast.success("Status updated successfully!");
    },
    onError: (error) => {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    },
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId) =>
      issuesApi.assign(id, { assignee_id: assigneeId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      toast.success("Issue assigned successfully!");
      setAssignOpen(false);
    },
    onError: (error) => {
      console.error("Assignment error:", error);
      toast.error("Failed to assign issue");
    },
  });

  const editMutation = useMutation({
    mutationFn: (data) => issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      setIsEditing(false);
      toast.success("Issue updated successfully!");
    },
    onError: (error) => {
      console.error("Edit error:", error);
      toast.error("Failed to update issue");
    },
  });


const commentMutation = useMutation({
  mutationFn: async (commentData) => {
    console.log("DEBUG: Posting comment to issue:", id);
    console.log("DEBUG: Comment data:", commentData);
    
    try {
      const response = await commentsApi.create(id, {
        content: commentData.content,
        visibility: commentData.visibility || "public",
      });
      
      console.log("DEBUG: Comment created successfully:", response.data);
      return response;
    } catch (error) {
      console.error("DEBUG: Full error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      throw error;
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["comments", id]);
    toast.success("Comment posted successfully!");
  },
  onError: (error) => {
    console.error("Comment error:", error);
    
    if (error.response?.status === 500) {
      toast.error("Server error. Check Django logs for details.");
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to comment on this issue");
    } else if (error.response?.status === 404) {
      toast.error("Issue not found");
    } else {
      toast.error("Failed to post comment");
    }
  },
});

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }) =>
      commentsApi.update(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
      toast.success("Comment updated successfully!");
    },
    onError: (error) => {
      console.error("Edit comment error:", error);
      toast.error("Failed to update comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentsApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
      toast.success("Comment deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete comment error:", error);
      toast.error("Failed to delete comment");
    },
  });

  // Handle comment submission from CommentEditor
  const handlePostComment = async (content) => {
    return commentMutation.mutateAsync({
      content,
      visibility: commentVisibility,
    });
  };

  // Handle edit comment
  const handleEditComment = (commentId, newContent) => {
    editCommentMutation.mutate({ commentId, content: newContent });
  };

  // Handle delete comment
  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    uploadMutation.mutate(file);
  };

  // Check permissions
  const isIssueCreator = user?.id === issueRes?.created_by?.id;
  const isAssignedStaff = user?.id === issueRes?.assignee?.id;
  const currentUserRole = userRole || user?.role;

  // Render role-specific buttons
  const renderActionButtons = () => {
    if (!issueRes) return null;

    // Client buttons
    if (currentUserRole === "client" && isIssueCreator) {
      return (
        <div className="flex flex-wrap gap-2">
          {issueRes.status === "resolved" && (
            <Button
              variant="primary"
              onClick={() => {
                if (
                  confirm(
                    "Confirm this issue is resolved to your satisfaction?"
                  )
                ) {
                  statusMutation.mutate("client-approved");
                }
              }}
            >
              <CheckCircle size={16} className="mr-2" />
              Confirm Resolution
            </Button>
          )}
          {issueRes.status === "closed" && (
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm("Reopen this issue?")) {
                  statusMutation.mutate("reopen");
                }
              }}
            >
              Reopen Issue
            </Button>
          )}
        </div>
      );
    }

    // Manager buttons
    if (currentUserRole === "manager") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setAssignOpen(true)}>
            Assign Staff
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const priorities = ["low", "medium", "high", "critical"];
              const currentPriority = issueRes?.priority || "low";
              const newPriority = prompt(
                `Current priority: ${currentPriority.toUpperCase()}\nEnter new priority (low/medium/high/critical):`,
                currentPriority
              );
              if (
                newPriority &&
                priorities.includes(newPriority.toLowerCase())
              ) {
                editMutation.mutate({ priority: newPriority.toLowerCase() });
              }
            }}
            className="flex items-center gap-2"
          >
            <Tag size={14} />
            Edit Priority
          </Button>
        </div>
      );
    }

    // Staff buttons
    if (currentUserRole === "staff") {
      return (
        <div className="flex flex-wrap gap-2 items-center">
          {(isAssignedStaff || !issueRes.assignee) && (
            <IssueStatusActions
              issue={issueRes}
              onChange={statusMutation.mutate}
            />
          )}

          <Button
            variant={commentVisibility === "internal" ? "primary" : "secondary"}
            onClick={() =>
              setCommentVisibility((prev) =>
                prev === "internal" ? "public" : "internal"
              )
            }
            className="flex items-center gap-2"
          >
            <Lock size={14} />
            {commentVisibility === "internal"
              ? "Internal Mode"
              : "Add Internal Note"}
          </Button>
        </div>
      );
    }

    return null;
  };

  if (authLoading || issueLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (issueError || !issueRes) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Issue not found
        </h3>
        <p className="mt-2 text-gray-500">
          The issue you're looking for doesn't exist or failed to load.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/issues")}
          className="mt-4"
        >
          Back to Issues
        </Button>
      </div>
    );
  }

  const issue = issueRes;
  const creatorDisplayName = getDisplayName(issue.created_by);
  const creatorEmail = getEmail(issue.created_by);
  const assigneeDisplayName = getDisplayName(issue.assignee);
  const assigneeEmail = getEmail(issue.assignee);

  // Edit mode
  if (isEditing && (currentUserRole === "manager" || isIssueCreator)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-6"
        >
          <ArrowLeft size={20} /> Cancel Edit
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Issue title"
            className="w-full text-2xl font-bold text-gray-900 border-b-2 border-teal-500 pb-2 mb-4 focus:outline-none"
          />

          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={8}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={() =>
                editMutation.mutate({
                  title: editTitle || issue.title,
                  description: editDesc || issue.description,
                })
              }
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>

            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="flex items-center gap-4">
          {/* Edit button for creator and managers */}
          {(isIssueCreator || currentUserRole === "manager") && (
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(true);
                setEditTitle(issue.title);
                setEditDesc(issue.description);
              }}
              className="flex items-center gap-2"
            >
              <Edit3 size={16} /> Edit
            </Button>
          )}

          {/* Role-specific action buttons */}
          {renderActionButtons()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue header card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {issue.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in-progress"
                        ? "bg-amber-100 text-amber-700"
                        : issue.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : issue.status === "closed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {issue.status
                      ? issue.status.replace("-", " ").toUpperCase()
                      : "UNKNOWN"}
                  </span>

                  {issue.priority && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        issue.priority === "low"
                          ? "bg-blue-100 text-blue-700"
                          : issue.priority === "medium"
                          ? "bg-orange-100 text-orange-700"
                          : issue.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {issue.priority.toUpperCase()} PRIORITY
                    </span>
                  )}

                  <span className="text-sm text-gray-500">
                    Created by {creatorDisplayName}
                  </span>
                </div>
              </div>

              {/* Status icon */}
              <div className="text-gray-400">
                {issue.status === "open" && <AlertCircle size={24} />}
                {issue.status === "in-progress" && <Clock size={24} />}
                {issue.status === "resolved" && <CheckCircle size={24} />}
                {issue.status === "closed" && (
                  <CheckCircle size={24} className="text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* Original issue description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getUserInitials(creatorDisplayName)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-semibold text-gray-900">
                    {creatorDisplayName}
                  </span>
                  {creatorEmail && creatorEmail !== creatorDisplayName && (
                    <span className="text-sm text-gray-500">
                      ({creatorEmail})
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    opened on {formatDate(issue.created_at)}
                  </span>
                </div>

                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comments ({sortedComments.length})
              {commentsError && commentsError.response?.status !== 404 && (
                <span className="text-red-500 text-sm ml-2">
                  (Error loading comments)
                </span>
              )}
            </h3>

            {/* Comments list */}
            <div className="space-y-4 mb-6">
              {commentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading comments...</p>
                </div>
              ) : sortedComments.length > 0 ? (
                sortedComments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    userRole={currentUserRole}
                    currentUser={user}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Comment editor */}
            <div className="pt-6 border-t border-gray-200">
              <CommentEditor
                issueId={id}
                onPost={handlePostComment}
                visibility={commentVisibility}
                onVisibilityChange={setCommentVisibility}
                isSubmitting={commentMutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - right column */}
        <div className="space-y-6">
          {/* Assignee card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} /> Assignee
            </h3>

            {assigneeDisplayName && assigneeDisplayName !== "Unknown" ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getUserInitials(assigneeDisplayName)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {assigneeDisplayName}
                  </p>
                  {assigneeEmail && assigneeEmail !== assigneeDisplayName && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail size={12} /> {assigneeEmail}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No one assigned</p>
              </div>
            )}

            {currentUserRole === "manager" && (
              <Button
                variant="secondary"
                onClick={() => setAssignOpen(true)}
                className="w-full mt-4"
              >
                {assigneeDisplayName && assigneeDisplayName !== "Unknown"
                  ? "Reassign Staff"
                  : "Assign Staff"}
              </Button>
            )}
          </div>

          {/* Attachments card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Paperclip size={18} /> Attachments ({allAttachments.length})
            </h3>

            <FileUploader
              onUpload={(files) => {
                if (files && files.length > 0) {
                  handleFileUpload(files[0]);
                }
              }}
              isUploading={uploading || uploadMutation.isPending}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              maxSize={10 * 1024 * 1024}
            />

            {uploadMutation.isPending && (
              <div className="mt-2 flex items-center gap-2 text-sm text-teal-600">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-teal-500"></div>
                Uploading file...
              </div>
            )}

            <div className="mt-4 space-y-2">
              {allAttachments.length > 0 ? (
                allAttachments.map((attachment, index) => (
                  <div
                    key={attachment.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                          {attachment.filename ||
                            attachment.name ||
                            attachment.file?.split("/").pop() ||
                            "Unnamed file"}
                        </p>
                        {attachment.size && (
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        )}
                      </div>
                    </div>

                    {(attachment.url || attachment.file) && (
                      <a
                        href={attachment.url || attachment.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 p-1"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Paperclip className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">No attachments yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload files using the box above
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Issue ID</p>
                <p className="font-medium text-gray-900">#{issue.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {formatDate(issue.created_at)}
                </p>
              </div>

              {issue.updated_at && (
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(issue.updated_at)}
                  </p>
                </div>
              )}

              {issue.due_date && (
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(issue.due_date)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {assignOpen && (
        <AssignModal
          issue={issue}
          staffUsers={staffUsers}
          onClose={() => setAssignOpen(false)}
          onAssign={(assigneeId) => assignMutation.mutate(assigneeId)}
        />
      )}
    </motion.div>
  );
}
