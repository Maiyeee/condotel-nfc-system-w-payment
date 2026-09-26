const DAY_MS = 24 * 60 * 60 * 1000;

export const DATE_RANGES = ["Today", "7 Days", "30 Days", "All Time"];

export function filterByDateRange(items, dateField, range) {
  if (range === "All Time") return items;

  const now = Date.now();
  const cutoff =
    range === "Today"
      ? now - DAY_MS
      : range === "7 Days"
      ? now - 7 * DAY_MS
      : now - 30 * DAY_MS;

  return items.filter((item) => {
    const value = item[dateField];
    if (!value) return false;
    const time = new Date(value).getTime();
    return !Number.isNaN(time) && time >= cutoff;
  });
}

export function revenueSummary(transactions) {
  const paid = transactions.filter((t) => t.status === "Paid");
  const failed = transactions.filter((t) => t.status === "Failed");
  const pending = transactions.filter((t) => t.status === "Pending");
  const totalRevenue = paid.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return {
    totalRevenue,
    paidCount: paid.length,
    failedCount: failed.length,
    pendingCount: pending.length,
    avgTransaction: paid.length ? Math.round(totalRevenue / paid.length) : 0,
  };
}

export function revenueByDay(transactions) {
  const paid = transactions.filter((t) => t.status === "Paid");
  const grouped = new Map();

  paid.forEach((t) => {
    const day = (t.createdAt || "").slice(0, 10);
    if (!day) return;
    grouped.set(day, (grouped.get(day) || 0) + Number(t.amount || 0));
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

export function revenueByMethod(transactions) {
  const paid = transactions.filter((t) => t.status === "Paid");
  const grouped = new Map();

  paid.forEach((t) => {
    grouped.set(t.method, (grouped.get(t.method) || 0) + Number(t.amount || 0));
  });

  return [...grouped.entries()].map(([name, value]) => ({ name, value }));
}

export function revenueByRoom(transactions, topN = 5) {
  const paid = transactions.filter((t) => t.status === "Paid");
  const grouped = new Map();

  paid.forEach((t) => {
    const key = t.room || "Unknown";
    grouped.set(key, (grouped.get(key) || 0) + Number(t.amount || 0));
  });

  return [...grouped.entries()]
    .map(([room, total]) => ({ room, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
}

export function occupancySummary(rooms) {
  const total = rooms.length;
  const occupied = rooms.filter((r) => r.status === "Occupied").length;
  const available = rooms.filter((r) => r.status === "Available").length;
  const maintenance = rooms.filter((r) => r.status === "Maintenance").length;
  const rate = total ? Math.round((occupied / total) * 100) : 0;

  const byTypeMap = new Map();
  rooms.forEach((room) => {
    const key = room.type || "Other";
    const entry = byTypeMap.get(key) || { type: key, total: 0, occupied: 0 };
    entry.total += 1;
    if (room.status === "Occupied") entry.occupied += 1;
    byTypeMap.set(key, entry);
  });

  return {
    total,
    occupied,
    available,
    maintenance,
    rate,
    byType: [...byTypeMap.values()],
  };
}

export function reservationsSummary(reservations) {
  const byStatus = {};
  reservations.forEach((r) => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  });

  return { total: reservations.length, byStatus };
}

export function formatCurrency(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
