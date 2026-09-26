import { useMemo, useState } from "react";
import { CheckCheck, Trash2, BellOff } from "lucide-react";
import { useNotificationStore } from "./notificationStore";
import { NOTIFICATION_TYPES } from "./notificationData";
import { TYPE_META, formatRelativeTime } from "./notificationMeta";

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const remove = useNotificationStore((s) => s.remove);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const resetDemoData = useNotificationStore((s) => s.resetDemoData);

  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const filtered = useMemo(() => {
    return [...notifications]
      .filter((item) => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Unread") return !item.isRead;
        return item.type === activeFilter;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications, activeFilter]);

  function handleClearAll() {
    const confirmed = window.confirm(
      "Clear all notifications? This action cannot be undone.",
    );
    if (!confirmed) return;
    clearAll();
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
              Phase 6
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0b4f8a]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Check-ins, payments, reservations, and NFC card activity across
              the property.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {["All", "Unread", ...NOTIFICATION_TYPES].map((filter) => {
              const selected = activeFilter === filter;
              const count =
                filter === "All"
                  ? notifications.length
                  : filter === "Unread"
                  ? unreadCount
                  : notifications.filter((item) => item.type === filter).length;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    selected
                      ? "bg-[#0b4f8a] text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <BellOff size={22} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  No notifications here
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try a different filter, or check back once new activity
                  comes in.
                </p>
              </div>
            )}

            {filtered.map((notification) => {
              const meta = TYPE_META[notification.type] ?? TYPE_META.Reservation;
              const Icon = meta.icon;

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 px-2 py-4 ${
                    notification.isRead ? "" : "bg-blue-50/40"
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.classes}`}>
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#0b4f8a] align-middle" />
                        )}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{notification.message}</p>
                    {notification.reference && (
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        {notification.reference}
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-[#0b4f8a] hover:bg-blue-50"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(notification.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Notifications are stored in browser localStorage for this
            standalone Phase 6 prototype.
          </p>
          <button
            type="button"
            onClick={resetDemoData}
            className="font-semibold text-[#0b4f8a] hover:underline"
          >
            Reset demo notifications
          </button>
        </div>
      </div>
    </div>
  );
}
