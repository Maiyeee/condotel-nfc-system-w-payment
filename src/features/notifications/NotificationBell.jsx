import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "./notificationStore";
import { TYPE_META, formatRelativeTime } from "./notificationMeta";

const PREVIEW_COUNT = 5;

export default function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const preview = useMemo(
    () =>
      [...notifications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, PREVIEW_COUNT),
    [notifications],
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleItemClick(notification) {
    markAsRead(notification.id);
    setOpen(false);
    navigate("/notifications");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-bold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-[#0b4f8a] hover:underline"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {preview.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                You&apos;re all caught up.
              </p>
            ) : (
              preview.map((notification) => {
                const meta = TYPE_META[notification.type] ?? TYPE_META.Reservation;
                const Icon = meta.icon;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleItemClick(notification)}
                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 ${
                      notification.isRead ? "" : "bg-blue-50/40"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.classes}`}>
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-800">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#0b4f8a]" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 line-clamp-2">
                        {notification.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="block w-full border-t border-slate-100 px-4 py-2.5 text-center text-xs font-semibold text-[#0b4f8a] hover:bg-slate-50"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
