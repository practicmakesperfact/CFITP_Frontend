import { Bell, X } from "lucide-react";
import { useState } from "react";
import { notificationsApi } from "../../api/notificationsApi";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications with error handling
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((res) => res.data),
    refetchInterval: 30000,
    retry: 2,
  });

  // SAFE extraction of notifications array
  const extractNotifications = (response) => {
    if (!response) return [];

    // Handle different API response formats
    if (Array.isArray(response)) {
      return response; // Direct array: [...]
    } else if (response.results && Array.isArray(response.results)) {
      return response.results; // DRF paginated: {results: [...]}
    } else if (response.data && Array.isArray(response.data)) {
      return response.data; // Custom: {data: [...]}
    } else if (
      response.notifications &&
      Array.isArray(response.notifications)
    ) {
      return response.notifications; // Alternative: {notifications: [...]}
    }

    // If we can't find an array, return empty
    console.warn("Unexpected API response format:", response);
    return [];
  };

  const notifications = extractNotifications(apiResponse);

  // Debug log (remove in production)
  console.log("API Response:", apiResponse);
  console.log("Extracted notifications:", notifications);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
    },
  });

  // Mark all as read
  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter((n) => n && !n.is_read);
    if (unreadNotifications.length === 0) return;

    Promise.all(unreadNotifications.map((n) => notificationsApi.markRead(n.id)))
      .then(() => {
        queryClient.invalidateQueries(["notifications"]);
        toast.success(
          `${unreadNotifications.length} notification(s) marked as read`
        );
      })
      .catch(() => {
        toast.error("Failed to mark all as read");
      });
  };

  // Safe calculation of unread count
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => n && !n.is_read).length
    : 0;
  const hasUnread = unreadCount > 0;

  // If there's an API error, show minimal bell without dropdown
  if (error) {
    return (
      <div className="relative">
        <button
          className="relative p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Notifications (Error)"
          title="Failed to load notifications"
        >
          <Bell size={24} className="text-gray-400" />
          <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            !
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
        aria-label="Notifications"
        disabled={isLoading}
      >
        <Bell
          size={24}
          className={`${hasUnread ? "text-[#0EA5A4]" : "text-slate-600"} ${
            isLoading ? "opacity-50" : ""
          }`}
        />
        {hasUnread && !isLoading && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {isLoading && (
          <span className="absolute -top-1 -right-1 bg-gray-300 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            ...
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg">Notifications</h3>
              {hasUnread && !isLoading && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
              {isLoading && (
                <span className="bg-gray-300 text-white text-xs px-2 py-1 rounded-full">
                  Loading...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasUnread && !isLoading && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#0EA5A4] hover:text-teal-600 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-[#0EA5A4] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-gray-300" size={48} />
                <p className="text-gray-500 mt-4">No notifications yet</p>
                <p className="text-sm text-gray-400">
                  You'll see alerts here for new issues, comments, and feedback
                </p>
              </div>
            ) : (
              notifications
                .filter((n) => n && typeof n === "object") // Filter out any invalid items
                .map((notif) => (
                  <div
                    key={notif.id || Math.random()}
                    className={`p-4 border-b hover:bg-gray-50 transition ${
                      notif.is_read ? "opacity-75" : "bg-blue-50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
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
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800">
                          {notif.message || "No message"}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {notif.created_at
                            ? new Date(notif.created_at).toLocaleString()
                            : "Unknown date"}
                        </p>
                      </div>

                      {!notif.is_read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notif.id)}
                          disabled={markAsReadMutation.isLoading}
                          className="text-xs text-[#0EA5A4] hover:text-teal-600 font-medium ml-4 whitespace-nowrap"
                        >
                          Mark read
                        </button>
                      )}
                    </div>

                    {notif.issue && (
                      <a
                        href={`/app/issues/${notif.issue}`}
                        className="text-xs text-[#FB923C] hover:text-orange-600 font-medium mt-2 inline-block"
                      >
                        View Issue →
                      </a>
                    )}
                  </div>
                ))
            )}
          </div>

          {Array.isArray(notifications) && notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <a
                href="/app/notifications"
                className="text-sm text-[#0EA5A4] hover:text-teal-600 font-medium"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
