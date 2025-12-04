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
  X,
} from "lucide-react";

import { issuesApi } from "../../api/issuesApi.js";
import { commentsApi } from "../../api/commentsApi.js";
import { notificationsApi } from "../../api/notificationsApi.js";

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
  const { user: currentUser } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log("Current user role:", userRole);
    console.log("Current user:", currentUser);
  }, [userRole, currentUser]);

  // Fetch staff users for assignment (managers only)
  const { data: staffUsers = [] } = useQuery({
    queryKey: ["staff-users"],
    queryFn: async () => {
      try {
        const response = await issuesApi.listAll();
        const users = response.results || [];
        return users.filter((u) => u.role === "staff");
      } catch (error) {
        console.error("Error fetching staff users:", error);
        return [];
      }
    },
    enabled: userRole === "manager",
  });

  // Fetch issue details
  const {
    data: issueRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => issuesApi.retrieve(id).then((res) => res.data),
    onSuccess: (data) => {
      console.log("Issue data loaded:", data);
      console.log("created_by type:", typeof data.created_by);
      console.log("assignee type:", typeof data.assignee);
    },
    onError: (err) => {
      console.error("Error loading issue:", err);
    },
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentsApi.list(id).then((res) => res.data),
  });

  // Helper functions - FIXED VERSION
  const getUserInitials = (name) => {
    // Check if name exists and is actually a string
    if (!name || typeof name !== "string") return "U";

    // Remove extra spaces and check if string is empty
    const trimmedName = name.trim();
    if (trimmedName === "") return "U";

    // Now safely split the string
    const nameParts = trimmedName.split(" ").filter((part) => part.length > 0);

    // If no valid parts, return 'U'
    if (nameParts.length === 0) return "U";

    // Get first letter of each part
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");

    // Return first 2 letters or just 1 if only one name
    return initials.slice(0, 2);
  };

  // FIXED: Safe way to get display name from user object or string
  const getDisplayName = (userData) => {
    if (!userData) return "Unknown";

    // If it's already a string (email or name)
    if (typeof userData === "string") return userData;

    // If it's an object with properties
    if (typeof userData === "object") {
      // Check for various possible name fields
      if (userData.name) return userData.name;
      if (userData.first_name && userData.last_name) {
        return `${userData.first_name} ${userData.last_name}`;
      }
      if (userData.email) return userData.email;
      if (userData.username) return userData.username;
    }

    return "Unknown";
  };

  // FIXED: Safe way to get email from user object or string
  const getEmail = (userData) => {
    if (!userData) return "";

    // If it's already a string email
    if (typeof userData === "string" && userData.includes("@")) return userData;

    // If it's an object
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
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return issuesApi.uploadAttachment(id, formData);
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
      toast.success("Status updated");
    },
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId) =>
      issuesApi.assign(id, { assignee_id: assigneeId }),
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

  const commentMutation = useMutation({
    mutationFn: (commentData) => commentsApi.create(id, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
      toast.success("Comment added");
    },
  });

  // Check permissions
  const isIssueCreator = currentUser?.email === getEmail(issueRes?.created_by);
  const isAssignedStaff = currentUser?.email === getEmail(issueRes?.assignee);

  // Handle file upload
  const handleFileUpload = (file) => {
    setUploading(true);
    uploadMutation.mutate(file);
  };

  // Handle comment submission
  const handleCommentSubmit = (content) => {
    if (!content.trim()) return;

    commentMutation.mutate({
      content,
      visibility: commentVisibility,
    });
  };

  // Role-based action handlers
  const handleClientAction = (action) => {
    switch (action) {
      case "confirm_resolution":
        if (confirm("Confirm this issue is resolved to your satisfaction?")) {
          statusMutation.mutate("client-approved");
        }
        break;
      case "reopen_issue":
        if (confirm("Reopen this issue?")) {
          statusMutation.mutate("reopen");
        }
        break;
      case "close_issue":
        if (confirm("Close this issue? You can reopen it later if needed.")) {
          statusMutation.mutate("closed");
        }
        break;
      default:
        break;
    }
  };

  const handleManagerAction = (action) => {
    switch (action) {
      case "assign_staff":
        setAssignOpen(true);
        break;
      case "close_issue":
        if (confirm("Close this issue?")) {
          statusMutation.mutate("closed");
        }
        break;
      case "mark_out_of_scope":
        if (confirm("Mark this issue as out of scope?")) {
          statusMutation.mutate("out-of-scope");
        }
        break;
      case "edit_priority":
        toast.info("Priority edit feature coming soon");
        break;
      default:
        break;
    }
  };

  const handleStaffAction = (action) => {
    switch (action) {
      case "start_work":
        statusMutation.mutate("in-progress");
        break;
      case "mark_resolved":
        statusMutation.mutate("resolved");
        break;
      case "request_close":
        if (confirm("Request manager approval to close this issue?")) {
          statusMutation.mutate("pending-approval");
        }
        break;
      case "add_internal_note":
        setCommentVisibility((prev) =>
          prev === "internal" ? "public" : "internal"
        );
        toast.info(
          commentVisibility === "internal"
            ? "Now posting public comments"
            : "Now posting internal comments (staff/manager only)"
        );
        break;
      default:
        break;
    }
  };

  // Render role-specific buttons
  const renderActionButtons = () => {
    if (!issueRes) return null;

    // Client buttons
    if (userRole === "client" && isIssueCreator) {
      return (
        <div className="flex flex-wrap gap-2">
          {issueRes.status === "resolved" && (
            <Button
              variant="primary"
              onClick={() => handleClientAction("confirm_resolution")}
            >
              <CheckCircle size={16} className="mr-2" />
              Confirm Resolution
            </Button>
          )}
          {issueRes.status === "closed" && (
            <Button
              variant="secondary"
              onClick={() => handleClientAction("reopen_issue")}
            >
              Reopen Issue
            </Button>
          )}
          {issueRes.status === "open" && (
            <Button
              variant="danger"
              onClick={() => handleClientAction("close_issue")}
            >
              Close Issue
            </Button>
          )}
        </div>
      );
    }

    // Manager buttons
    if (userRole === "manager") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => handleManagerAction("assign_staff")}
          >
            Assign Staff
          </Button>

          {issueRes.status === "pending-approval" && (
            <Button
              variant="primary"
              onClick={() => handleManagerAction("close_issue")}
            >
              Close Issue
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => handleManagerAction("edit_priority")}
          >
            Edit Priority
          </Button>

          {issueRes.status !== "closed" &&
            issueRes.status !== "out-of-scope" && (
              <Button
                variant="danger"
                onClick={() => handleManagerAction("mark_out_of_scope")}
              >
                Mark Out of Scope
              </Button>
            )}
        </div>
      );
    }

    // Staff buttons
    if (userRole === "staff" && isAssignedStaff) {
      return (
        <div className="flex flex-wrap gap-2 items-center">
          <IssueStatusActions
            issue={issueRes}
            onChange={statusMutation.mutate}
          />

          {issueRes.status === "resolved" && (
            <Button
              variant="primary"
              onClick={() => handleStaffAction("request_close")}
            >
              Request Close Approval
            </Button>
          )}

          <Button
            variant={commentVisibility === "internal" ? "primary" : "secondary"}
            onClick={() => handleStaffAction("add_internal_note")}
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !issueRes) {
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

  // FIXED: Get safe display values
  const creatorDisplayName = getDisplayName(issue.created_by);
  const creatorEmail = getEmail(issue.created_by);
  const assigneeDisplayName = getDisplayName(issue.assignee);
  const assigneeEmail = getEmail(issue.assignee);

  // Edit mode
  if (isEditing && (userRole === "manager" || isIssueCreator)) {
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
          {(isIssueCreator || userRole === "manager") && (
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

                  {/* FIXED: Safe display of creator */}
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
              {/* User avatar with initials - FIXED */}
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
              Comments
            </h3>

            <div className="space-y-6">
              {comments.length > 0 ? (
                [...comments]
                  .reverse()
                  .map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      userRole={userRole}
                    />
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Comment editor */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <CommentEditor
                issueId={id}
                onPost={handleCommentSubmit}
                visibility={commentVisibility}
                onVisibilityChange={setCommentVisibility}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - right column */}
        <div className="space-y-6">
          {/* Assignee card - FIXED */}
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

            {userRole === "manager" && (
              <Button
                variant="secondary"
                onClick={() => setAssignOpen(true)}
                className="w-full mt-4"
              >
                {assigneeDisplayName && assigneeDisplayName !== "Unknown"
                  ? "Reassign"
                  : "Assign Staff"}
              </Button>
            )}
          </div>

          {/* Attachments card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Paperclip size={18} /> Attachments
            </h3>

            <FileUploader
              onUpload={handleFileUpload}
              isUploading={uploading}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />

            <div className="mt-4 space-y-2">
              {issue.attachments && issue.attachments.length > 0 ? (
                issue.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                          {attachment.filename ||
                            attachment.name ||
                            "Unnamed file"}
                        </p>
                        {attachment.size && (
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        )}
                      </div>
                    </div>

                    {attachment.url && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No attachments yet
                </p>
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
