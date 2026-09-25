const STORAGE_KEY = "condotel.rooms.phase2";

export function loadRooms(fallbackRooms) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return fallbackRooms;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallbackRooms;
  } catch {
    return fallbackRooms;
  }
}

export function saveRooms(rooms) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // localStorage can fail in private/restricted browser contexts.
  }
}
