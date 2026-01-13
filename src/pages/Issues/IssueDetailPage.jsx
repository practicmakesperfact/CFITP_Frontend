import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
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
  X,
  Send,
  ImageIcon,
  Trash2,
  UserCheck,
  Info,
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
import ImageModal from "../../components/UI/ImageModal.jsx";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const { userRole } = useUIStore();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (id === "new") {
      navigate("/issues/new");
      return;
    }
  }, [id, navigate]);

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
    refetch: refetchIssue,
  } = useQuery({
    queryKey: ["issues", id],
    queryFn: () => issuesApi.retrieve(id).then((res) => res.data),
    onError: (err) => {
      console.error("Error loading issue:", err);
      toast.error("Failed to load issue details");
    },
    enabled: !!id && !authLoading,
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
    enabled: !!id,
  });

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
    },
    enabled: !!id,
  });

  const issueAttachments = issueRes?.attachments || [];
  const allAttachments =
    attachments.length > 0 ? attachments : issueAttachments;

  // Fetch staff users for assignment - FIXED: Only show staff role, not managers
  const { data: staffUsers = [], isLoading: staffUsersLoading } = useQuery({
    queryKey: ["staff-users-for-assignment", id],
    queryFn: async () => {
      try {
        console.log("🔄 Fetching staff users for assignment...");
        const response = await axiosClient.get("/users/");

        // Handle different response formats
        const data = response.data;
        let users = [];

        if (data && data.results) {
          users = data.results;
        } else if (Array.isArray(data)) {
          users = data;
        }

        console.log(`📋 Total users from API: ${users.length}`);

        // FIX: Filter ONLY staff users (not managers)
        const staffOnly = users.filter((u) => {
          const isStaff = u.role === "staff" && u.is_active !== false;
          if (!isStaff) {
            console.log(`❌ Filtered out (not staff): ${u.email} (${u.role})`);
          }
          return isStaff;
        });

        console.log(`✅ Found ${staffOnly.length} staff users for assignment`);
        staffOnly.forEach((user, index) => {
          console.log(
            `👤 Staff ${index + 1}: ${user.email} - ${user.first_name || ""} ${
              user.last_name || ""
            }`
          );
        });

        return staffOnly;
      } catch (error) {
        console.error("❌ Error fetching staff users:", error);
        toast.error("Failed to load staff list");
        return [];
      }
    },
    enabled: (userRole === "manager" || userRole === "admin") && !!id,
    staleTime: 60000, // Cache for 1 minute
  });

  // Fetch users for mentions (all users)
  const { data: mentionableUsers = [] } = useQuery({
    queryKey: ["mentionable-users", id],
    queryFn: async () => {
      try {
        const response = await axiosClient.get("/users/");
        const data = response.data;
        let users = [];

        if (data && data.results) {
          users = data.results;
        } else if (Array.isArray(data)) {
          users = data;
        }

        return users.filter((u) => u.is_active !== false);
      } catch (error) {
        console.error("Error fetching users for mentions:", error);
        return [];
      }
    },
    enabled: !!id,
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
    if (!userData) return "Not assigned";
    if (typeof userData === "string") return userData;
    if (typeof userData === "object") {
      if (userData.name) return userData.name;
      if (userData.first_name && userData.last_name) {
        return `${userData.first_name} ${userData.last_name}`;
      }
      if (userData.email) return userData.email.split("@")[0];
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
        month: "short",
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

  // Sort comments
  const sortedComments = useMemo(() => {
    const clientComments = comments.filter(
      (c) => c.author?.role === "client" || c.author_role === "client"
    );
    const otherComments = comments.filter(
      (c) => c.author?.role !== "client" && c.author_role !== "client"
    );

    const sortByDate = (a, b) =>
      new Date(b.created_at) - new Date(a.created_at);

    return [
      ...clientComments.sort(sortByDate),
      ...otherComments.sort(sortByDate),
    ];
  }, [comments]);

  // Check permissions
  const isIssueCreator = user?.id === issueRes?.created_by?.id;
  const isAssignedStaff = user?.id === issueRes?.assignee?.id;
  const currentUserRole = userRole || user?.role;

  // Check if issue can be edited
  const canEditIssue = () => {
    if (!issueRes) return false;

    const editableStatuses = ["open", "reopen"];
    const isEditableStatus = editableStatuses.includes(issueRes.status);

    // Admin can always edit
    if (currentUserRole === "admin") {
      return true;
    }

    // Manager can always edit
    if (currentUserRole === "manager") {
      return true;
    }

    // Client can edit only their own issues in editable status
    if (currentUserRole === "client" && isIssueCreator) {
      return isEditableStatus;
    }

    // Staff can edit only assigned issues in editable status
    if (currentUserRole === "staff" && isAssignedStaff) {
      return isEditableStatus;
    }

    return false;
  };

  // Get edit restriction message
  const getEditRestrictionMessage = () => {
    if (!issueRes) return "";

    const editableStatuses = ["open", "reopen"];

    if (!editableStatuses.includes(issueRes.status)) {
      return `Editing is only allowed when issue status is "Open" or "Reopen". Current status: ${issueRes.status
        .replace(/_/g, " ")
        .toUpperCase()}`;
    }

    if (currentUserRole === "client" && !isIssueCreator) {
      return "Only the issue reporter can edit this issue.";
    }

    if (currentUserRole === "staff" && !isAssignedStaff) {
      return "Only assigned staff can edit this issue.";
    }

    return "";
  };

  // Handle attachment download
  const handleDownloadAttachment = async (attachment) => {
    try {
      const response = await attachmentsApi.download(attachment.id);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.filename || attachment.name || "download";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  // Handle attachment deletion
  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      try {
        await attachmentsApi.delete(attachmentId);
        queryClient.invalidateQueries(["attachments", id]);
        queryClient.invalidateQueries(["issues", id]);
        toast.success("Attachment deleted successfully!");
      } catch (error) {
        console.error("Delete attachment error:", error);
        toast.error("Failed to delete attachment");
      }
    }
  };

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      try {
        const response = await attachmentsApi.create(id, file);
        setSelectedFiles((prev) =>
          prev.filter((f) => f.name !== file.name && f.size !== file.size)
        );
        return response;
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["attachments", id]);
      queryClient.invalidateQueries(["issues", id]);
      toast.success("File uploaded successfully!");
    },
    onError: (error) => {
      let errorMsg = "Failed to upload file";
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      toast.error(errorMsg);
    },
    onSettled: () => setUploading(false),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => issuesApi.transition(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      queryClient.invalidateQueries(["issues-all"]);
      toast.success("Status updated successfully!");
    },
    onError: (error) => {
      let errorMsg = "Failed to update status";
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      toast.error(errorMsg);
    },
  });

  // FIXED: Better assignment mutation with reassignment prevention
  const assignMutation = useMutation({
    mutationFn: async (assigneeId) => {
      setIsAssigning(true);

      // Check if trying to assign to same person
      if (issueRes?.assignee?.id === assigneeId) {
        const staffUser = staffUsers.find((u) => u.id === assigneeId);
        const staffName = getDisplayName(staffUser);
        throw new Error(`This issue is already assigned to ${staffName}`);
      }

      return await issuesApi.assign(id, { assignee_id: assigneeId });
    },
    onSuccess: (response, assigneeId) => {
      const staffUser = staffUsers.find((u) => u.id === assigneeId);
      const staffName = getDisplayName(staffUser);
      const staffEmail = getEmail(staffUser);

      // Show appropriate message based on whether it was reassigned
      if (issueRes?.assignee) {
        toast.success(`Issue reassigned to ${staffName} (${staffEmail})`);
      } else {
        toast.success(`Issue assigned to ${staffName} (${staffEmail})`);
      }

      queryClient.invalidateQueries(["issues", id]);
      setIsAssigning(false);
      setAssignOpen(false);

      // Refresh the issue data
      refetchIssue();
    },
    onError: (error, assigneeId) => {
      console.error("❌ Assignment error:", error);
      setIsAssigning(false);

      let errorMessage = "Failed to assign issue";
      let isAlreadyAssigned = false;

      // Check for specific error cases
      if (error.message.includes("already assigned")) {
        errorMessage = error.message;
        isAlreadyAssigned = true;
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.detail?.includes("already assigned")) {
          const staffUser = staffUsers.find((u) => u.id === assigneeId);
          errorMessage = `This issue is already assigned to ${getDisplayName(
            staffUser
          )}`;
          isAlreadyAssigned = true;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to assign this issue";
      } else if (error.response?.status === 404) {
        errorMessage = "Issue or staff member not found";
      }

      // Show user-friendly error message
      if (isAlreadyAssigned) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: <Info className="text-amber-500" />,
          style: {
            background: "#fef3c7",
            color: "#92400e",
            border: "1px solid #fbbf24",
          },
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data) => {
      return await issuesApi.update(id, data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["issues", id]);
      setIsEditing(false);
      toast.success("Issue updated successfully!");
    },
    onError: (error) => {
      let errorMsg = "Failed to update issue";
      if (error.response?.status === 403) {
        errorMsg = "You don't have permission to edit this issue";
      } else if (error.response?.status === 400) {
        errorMsg = "Validation error: " + JSON.stringify(error.response.data);
      } else if (error.response?.status === 404) {
        errorMsg = "Issue not found";
      }
      toast.error(errorMsg);
    },
  });

  // Mutation for editing priority
  const priorityMutation = useMutation({
    mutationFn: (priority) => issuesApi.update(id, { priority }),
    onSuccess: () => {
      queryClient.invalidateQueries(["issues", id]);
      toast.success("Priority updated successfully!");
    },
    onError: (error) => {
      let errorMsg = "Failed to update priority";
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      toast.error(errorMsg);
    },
  });

  // Comment mutations
  const commentMutation = useMutation({
    mutationFn: async (commentData) => {
      const response = await commentsApi.create(id, commentData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
      toast.success("Comment posted successfully!");
    },
    onError: (error) => {
      console.error("Comment error:", error);
      toast.error("Failed to post comment");
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

  // Handle comment operations
  const handleEditComment = (commentId, newContent) => {
    editCommentMutation.mutate({ commentId, content: newContent });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handlePostComment = async (content, files = []) => {
    try {
      const commentData = {
        content,
        visibility: commentVisibility,
      };

      const commentResponse = await commentsApi.create(id, commentData);
      const comment = commentResponse.data;

      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          try {
            const response = await attachmentsApi.createForComment(
              comment.id,
              file
            );
            return response.data.id;
          } catch (error) {
            console.error("Error uploading attachment:", error);
            return null;
          }
        });

        await Promise.all(uploadPromises);
      }

      queryClient.invalidateQueries(["comments", id]);
      queryClient.invalidateQueries(["attachments", id]);
      toast.success("Comment posted successfully!");
      return comment;
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error(
        "Failed to post comment: " +
          (error.response?.data?.detail || error.message)
      );
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    uploadMutation.mutate(file);
  };

  // Get mentionable users for comment editor
  const getMentionableUsers = (query) => {
    if (!query) return mentionableUsers.slice(0, 5);
    const lowerQuery = query.toLowerCase();
    return mentionableUsers
      .filter(
        (u) =>
          u.email?.toLowerCase().includes(lowerQuery) ||
          u.first_name?.toLowerCase().includes(lowerQuery) ||
          u.last_name?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5);
  };

  // Check if current user can assign
  const canAssignIssue = () => {
    return currentUserRole === "manager" || currentUserRole === "admin";
  };

  // Handle priority change
  const handlePriorityChange = () => {
    if (!issueRes) return;

    const priorities = ["low", "medium", "high", "critical"];
    const currentPriority = issueRes.priority || "low";

    const newPriority = prompt(
      `Current priority: ${currentPriority.toUpperCase()}\n` +
        `Enter new priority (${priorities.join("/")}):`,
      currentPriority
    );

    if (newPriority && priorities.includes(newPriority.toLowerCase())) {
      priorityMutation.mutate(newPriority.toLowerCase());
    } else if (newPriority) {
      toast.error(`Invalid priority. Must be one of: ${priorities.join(", ")}`);
    }
  };

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
              className="flex items-center gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
            >
              <CheckCircle size={14} className="w-3 h-3 sm:w-4 sm:h-4" />
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
              className="flex items-center gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
            >
              Reopen Issue
            </Button>
          )}
        </div>
      );
    }

    // Manager/Admin buttons
    if (currentUserRole === "manager" || currentUserRole === "admin") {
      return (
        <div className="flex flex-wrap gap-2 items-center">
          {/* Assign Staff Button */}
          <Button
            variant="primary"
            onClick={() => {
              if (staffUsers.length === 0) {
                toast.error("No staff available to assign", {
                  duration: 3000,
                  icon: <AlertCircle className="text-red-500" size={18} />,
                });
                return;
              }

              // Check if there are staff users other than the current assignee
              const otherStaff = staffUsers.filter(
                (staff) => staff.id !== issueRes?.assignee?.id
              );
              if (otherStaff.length === 0 && issueRes?.assignee) {
                toast.error("No other staff available to reassign to", {
                  duration: 3000,
                  icon: <AlertCircle className="text-amber-500" size={18} />,
                  style: {
                    background: "#fef3c7",
                    color: "#92400e",
                  },
                });
                return;
              }

              setAssignOpen(true);
            }}
            disabled={isAssigning || staffUsersLoading}
            className="flex items-center gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
          >
            {isAssigning ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                Assigning...
              </>
            ) : staffUsersLoading ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                Loading staff...
              </>
            ) : staffUsers.length === 0 ? (
              <>
                <AlertCircle size={14} className="w-3 h-3 sm:w-4 sm:h-4" />
                No Staff Available
              </>
            ) : (
              <>
                <UserCheck size={14} className="w-3 h-3 sm:w-4 sm:h-4" />
                {issueRes.assignee ? "Reassign Staff" : "Assign Staff"}
              </>
            )}
          </Button>

          {/* Edit Priority Button - RESTORED */}
          <Button
            variant="secondary"
            onClick={handlePriorityChange}
            disabled={priorityMutation.isPending}
            className="flex items-center gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
          >
            <Tag size={14} className="w-3 h-3 sm:w-4 sm:h-4" />
            {priorityMutation.isPending ? "Updating..." : "Edit Priority"}
          </Button>

          {/* Currently Assigned Info */}
          {issueRes.assignee && (
            <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              <UserCheck size={12} className="inline mr-1" />
              Currently assigned to: {getDisplayName(issueRes.assignee)}
            </div>
          )}
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
            className="flex items-center gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
          >
            <Lock size={14} className="w-3 h-3 sm:w-4 sm:h-4" />
            {commentVisibility === "internal"
              ? "Internal Mode"
              : "Add Internal Note"}
          </Button>
        </div>
      );
    }

    return null;
  };

  // Handle assignment from modal
  const handleAssignSubmit = (assigneeId) => {
    assignMutation.mutate(assigneeId);
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
  if (isEditing && canEditIssue()) {
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
      className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8"
    >
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600 text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="w-4 h-4 sm:w-5 sm:h-5" /> Back
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
          {/* Edit button with status check */}
          {canEditIssue() ? (
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(true);
                setEditTitle(issue.title);
                setEditDesc(issue.description);
              }}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
            >
              <Edit3 size={14} className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
            </Button>
          ) : (
            <div className="relative group">
              <Button
                variant="secondary"
                disabled
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4 opacity-50 cursor-not-allowed"
              >
                <Edit3 size={14} className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
              </Button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 pointer-events-none">
                {getEditRestrictionMessage()}
              </div>
            </div>
          )}

          {/* Role-specific action buttons */}
          {renderActionButtons()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main content - left column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Issue header card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
              <div className="w-full">
                <h1 className="   text-gray-900 mb-2 break-words">
                  {issue.title}
                </h1>
                <h6 className="  text-gray-900 mb-2 break-words">
                  {issue.description}
                </h6>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      issue.status === "open"
                        ? "bg-red-100 text-red-700"
                        : issue.status === "in_progress" ||
                          issue.status === "in-progress"
                        ? "bg-amber-100 text-amber-700"
                        : issue.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : issue.status === "closed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {issue.status
                      ? issue.status
                          .replace(/_/g, " ")
                          .replace("-", " ")
                          .toUpperCase()
                      : "UNKNOWN"}
                  </span>

                  {issue.priority && (
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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

                  <span className="text-xs sm:text-sm text-gray-500">
                    Created by {creatorDisplayName}
                  </span>
                </div>
              </div>

              {/* Status icon */}
              <div className="text-gray-400">
                {issue.status === "open" && <AlertCircle size={24} />}
                {(issue.status === "in_progress" ||
                  issue.status === "in-progress") && <Clock size={24} />}
                {issue.status === "resolved" && <CheckCircle size={24} />}
                {issue.status === "closed" && (
                  <CheckCircle size={24} className="text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* Original issue description */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getUserInitials(creatorDisplayName)}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-3">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {creatorDisplayName}
                  </span>
                  {creatorEmail && creatorEmail !== creatorDisplayName && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      ({creatorEmail})
                    </span>
                  )}
                  <span className="text-xs sm:text-sm text-gray-500">
                    opened on {formatDate(issue.created_at)}
                  </span>
                </div>

                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">
                    {issue.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
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
                mentionedUsers={mentionableUsers}
                onMentionSearch={getMentionableUsers}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - right column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Assignee card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} /> Assignee
              </h3>

              {canAssignIssue() && (
                <button
                  onClick={() => setAssignOpen(true)}
                  disabled={isAssigning || staffUsersLoading}
                  className={`text-sm font-medium ${
                    isAssigning || staffUsersLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-teal-600 hover:text-teal-700"
                  }`}
                >
                  {isAssigning
                    ? "Assigning..."
                    : issue.assignee
                    ? "Reassign"
                    : "Assign"}
                </button>
              )}
            </div>

            {assigneeDisplayName && assigneeDisplayName !== "Not assigned" ? (
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getUserInitials(assigneeDisplayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {assigneeDisplayName}
                    </p>
                    <UserCheck size={14} className="text-teal-500" />
                  </div>
                  {assigneeEmail && assigneeEmail !== assigneeDisplayName && (
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                      <Mail size={12} /> {assigneeEmail}
                    </p>
                  )}
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                      Assigned Staff
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-700 font-medium">No one assigned</p>
                <p className="text-gray-500 text-sm mt-1">
                  {canAssignIssue()
                    ? "Click 'Assign' to assign this issue to staff"
                    : "Waiting for manager assignment"}
                </p>
              </div>
            )}

            {/* Staff availability notice */}
            {canAssignIssue() &&
              staffUsers.length === 0 &&
              !staffUsersLoading && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-amber-700 text-sm font-medium">
                        No staff available
                      </p>
                      <p className="text-amber-600 text-xs mt-1">
                        Add staff users with "staff" role to assign issues
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Attachments card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Paperclip size={18} /> Attachments (
              {allAttachments.length + selectedFiles.length})
            </h3>

            <FileUploader
              multiple
              onUpload={(files) => {
                if (!files?.length) return;
                const arr = Array.isArray(files) ? files : [files];
                setSelectedFiles((prev) => [...prev, ...arr]);
                arr.forEach((file) => handleFileUpload(file));
              }}
            />

            {uploadMutation.isPending && (
              <div className="mt-2 flex items-center gap-2 text-sm text-teal-600">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-teal-500"></div>
                Uploading file...
              </div>
            )}

            <div className="mt-4 space-y-2">
              {selectedFiles.length > 0 && (
                <>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`selected-${index}`}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Paperclip
                          size={16}
                          className="text-blue-400 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name || file.filename || "Unnamed file"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.size
                              ? formatFileSize(file.size)
                              : "Uploading..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {allAttachments.length > 0
                ? allAttachments.map((attachment, index) => {
                    const isImage =
                      attachment.mime_type?.startsWith("image/") ||
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(
                        attachment.file_url || attachment.filename || ""
                      );

                    return (
                      <div
                        key={attachment.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Paperclip
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.filename ||
                                attachment.name ||
                                (attachment.file_url
                                  ? attachment.file_url.split("/").pop()
                                  : "Unnamed file")}
                            </p>
                            {attachment.size && (
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isImage && (
                            <button
                              onClick={() => {
                                setSelectedImage({ id: attachment.id });
                              }}
                              className="text-teal-600 hover:text-teal-700 p-1"
                              title="View image"
                            >
                              <ImageIcon size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="text-teal-600 hover:text-teal-700 p-1"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAttachment(attachment.id)
                            }
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                : selectedFiles.length === 0 && (
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

          {/* Details panel */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Issue ID</p>
                <p className="font-medium text-gray-900">
                  #{issue.id.slice(0, 8)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    issue.status === "open"
                      ? "bg-red-100 text-red-700"
                      : issue.status === "in_progress" ||
                        issue.status === "in-progress"
                      ? "bg-amber-100 text-amber-700"
                      : issue.status === "resolved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {issue.status
                    ?.replace(/_/g, " ")
                    .replace("-", " ")
                    .toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      issue.priority === "low"
                        ? "bg-blue-100 text-blue-700"
                        : issue.priority === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : issue.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {issue.priority?.toUpperCase()}
                  </span>
                  {(currentUserRole === "manager" ||
                    currentUserRole === "admin") && (
                    <button
                      onClick={handlePriorityChange}
                      className="text-xs text-teal-600 hover:text-teal-700"
                      title="Edit priority"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(issue.created_at)}
                </p>
              </div>

              {issue.updated_at && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(issue.updated_at)}
                  </p>
                </div>
              )}

              {issue.due_date && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Due Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(issue.due_date)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-1">Reporter</p>
                <p className="text-sm font-medium text-gray-900">
                  {creatorDisplayName}
                </p>
              </div>
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
          onAssign={handleAssignSubmit}
          isLoading={isAssigning || staffUsersLoading}
          currentAssignee={issue.assignee}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          attachmentId={selectedImage.id}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </motion.div>
  );
}
