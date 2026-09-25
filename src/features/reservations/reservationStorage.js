const STORAGE_KEY = "condotel.reservations.phase2";

export function loadReservations(fallbackReservations) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallbackReservations;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallbackReservations;
  } catch {
    return fallbackReservations;
  }
}

export function saveReservations(reservations) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch {
    // Storage may be unavailable in restricted/private browser contexts.
  }
}
