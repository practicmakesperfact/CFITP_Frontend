import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../api/notificationsApi";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((res) => res.data),
  });

  // SAFE extraction of notifications array
  const extractNotifications = (response) => {
    if (!response) return [];

    if (Array.isArray(response)) {
      return response;
    } else if (response.results && Array.isArray(response.results)) {
      return response.results;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (
      response.notifications &&
      Array.isArray(response.notifications)
    ) {
      return response.notifications;
    }

    console.warn("Unexpected API response format:", response);
    return [];
  };

  const notifications = extractNotifications(apiResponse);

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter((n) => n && !n.is_read)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    Promise.all(unreadIds.map((id) => notificationsApi.markRead(id)))
      .then(() => {
        queryClient.invalidateQueries(["notifications"]);
        toast.success(`${unreadIds.length} notification(s) marked as read`);
      })
      .catch(() => {
        toast.error("Failed to mark all as read");
      });
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => n && !n.is_read).length
    : 0;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            Error Loading Notifications
          </h1>
          <p className="text-red-600">
            Failed to load notifications. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-10"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Bell className="text-[#0EA5A4]" size={36} />
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Notifications</h1>
            <p className="text-slate-600 mt-2">
              {Array.isArray(notifications) ? notifications.length : 0}{" "}
              notification{notifications.length !== 1 ? "s" : ""}
              {unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-6 py-3 bg-[#0EA5A4] hover:bg-teal-600 text-white rounded-xl font-medium transition"
          >
            <Check size={20} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
        {!Array.isArray(notifications) || notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="mx-auto text-gray-300" size={64} />
            <p className="text-xl text-slate-600 mt-6">No notifications yet</p>
            <p className="text-slate-500 mt-2">
              You'll receive notifications for new issues, comments, and
              feedback
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications
              .filter((n) => n && typeof n === "object")
              .map((notif) => (
                <div
                  key={notif.id || Math.random()}
                  className={`p-6 rounded-2xl border ${
                    notif.is_read
                      ? "border-gray-200"
                      : "border-[#0EA5A4] bg-blue-50"
                  } hover:shadow-md transition`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            notif.type === "new_feedback"
                              ? "bg-teal-100 text-teal-800"
                              : notif.type === "assignment"
                              ? "bg-orange-100 text-orange-800"
                              : notif.type === "status_change"
                              ? "bg-blue-100 text-blue-800"
                              : notif.type === "feedback_converted"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {notif.type
                            ? notif.type.replace("_", " ").toUpperCase()
                            : "NOTIFICATION"}
                        </span>
                        <span className="text-sm text-slate-500">
                          {notif.created_at
                            ? new Date(notif.created_at).toLocaleString()
                            : "Unknown date"}
                        </span>
                        {!notif.is_read && (
                          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>

                      <p className="text-lg font-medium text-slate-800 mb-2">
                        {notif.message || "No message"}
                      </p>

                      {notif.issue && (
                        <a
                          href={`/app/issues/${notif.issue}`}
                          className="inline-flex items-center gap-2 text-[#FB923C] hover:text-orange-600 font-medium mt-2"
                        >
                          <span>View related issue</span>
                          <span>→</span>
                        </a>
                      )}
                    </div>

                    {!notif.is_read && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notif.id)}
                        disabled={markAsReadMutation.isLoading}
                        className="ml-6 px-4 py-2 bg-[#0EA5A4] hover:bg-teal-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                      >
                        {markAsReadMutation.isLoading ? "..." : "Mark Read"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
