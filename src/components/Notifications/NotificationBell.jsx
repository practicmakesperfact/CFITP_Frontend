
import { Bell, X } from "lucide-react";
import { useState, useEffect } from "react";
import mockIssues from "../../api/mockIssues.js";

const STORAGE_KEY = "cfitp_notifications";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // filter by role if stored
    const userRole = localStorage.getItem("user_role");
    const filtered = all.filter((n) => !n.role || n.role === userRole);
    setNotifications(filtered);
  };

  useEffect(() => {
    load();
    // listen to storage change (cross-tab) and to the signal key
    const handler = (e) => {
      if (e.key === STORAGE_KEY || e.key === "__cfitp_notif_signal__") load();
    };
    window.addEventListener("storage", handler);
    window.addEventListener("localstorage", handler); // some browsers
    // also periodically poll small interval to catch updates in same tab
    const t = setInterval(load, 1200);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("localstorage", handler);
      clearInterval(t);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    mockIssues.notifications.markRead(id).then(() => {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      // also write to storage to keep global state
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").map(
        (n) => (n.id === id ? { ...n, read: true } : n)
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
        }}
        className="relative p-2"
      >
        <Bell size={24} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">Notifications</h3>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-gray-500">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b ${
                    notif.read ? "bg-gray-50" : "bg-blue-50"
                  }`}
                >
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-blue-600 hover:underline mt-2 block"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
