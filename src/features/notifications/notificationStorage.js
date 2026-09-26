const STORAGE_KEY = "condotel.notifications.phase6";

export function loadNotifications(fallbackNotifications) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallbackNotifications;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallbackNotifications;
  } catch {
    return fallbackNotifications;
  }
}

export function saveNotifications(notifications) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Storage may be unavailable in restricted/private browser contexts.
  }
}
