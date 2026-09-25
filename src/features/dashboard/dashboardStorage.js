const STORAGE_KEY = "condotel.dashboard.phase3";

export function loadDashboard(fallback) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    return {
      ...fallback,
      ...parsed,
      stats: { ...fallback.stats, ...(parsed.stats || {}) },
      occupancy: Array.isArray(parsed.occupancy)
        ? parsed.occupancy
        : fallback.occupancy,
      recentReservations: Array.isArray(parsed.recentReservations)
        ? parsed.recentReservations
        : fallback.recentReservations,
      todaysPayments: Array.isArray(parsed.todaysPayments)
        ? parsed.todaysPayments
        : fallback.todaysPayments,
    };
  } catch {
    return fallback;
  }
}
