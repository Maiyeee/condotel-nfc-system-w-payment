import { create } from "zustand";
import { DEFAULT_NOTIFICATIONS } from "./notificationData";
import { loadNotifications, saveNotifications } from "./notificationStorage";

function persist(notifications) {
  saveNotifications(notifications);
  return notifications;
}

export const useNotificationStore = create((set) => ({
  notifications: loadNotifications(DEFAULT_NOTIFICATIONS),

  markAsRead: (id) =>
    set((state) => ({
      notifications: persist(
        state.notifications.map((item) =>
          item.id === id ? { ...item, isRead: true } : item,
        ),
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: persist(
        state.notifications.map((item) => ({ ...item, isRead: true })),
      ),
    })),

  remove: (id) =>
    set((state) => ({
      notifications: persist(
        state.notifications.filter((item) => item.id !== id),
      ),
    })),

  clearAll: () => set(() => ({ notifications: persist([]) })),

  resetDemoData: () =>
    set(() => ({ notifications: persist(DEFAULT_NOTIFICATIONS) })),

  // Lets other features (NFC check-in/out, payments, reservations)
  // push a live notification once they're wired up to call it.
  add: (notification) =>
    set((state) => ({
      notifications: persist([
        {
          id: `notif-${Date.now()}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          ...notification,
        },
        ...state.notifications,
      ]),
    })),
}));
