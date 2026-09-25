export const DEMO_DASHBOARD = {
  stats: {
    totalRooms: 24,
    currentGuests: 18,
    todaysCheckIns: 6,
    todaysPayments: 24500,
    availableRooms: 6,
    occupancyRate: 75,
  },

  occupancy: [
    { name: "Occupied", value: 18 },
    { name: "Available", value: 6 },
    { name: "Maintenance", value: 0 },
  ],

  recentReservations: [
    {
      referenceNo: "RES-001",
      guestName: "Juan Dela Cruz",
      room: "Room 101",
      checkIn: "2026-09-25",
      checkOut: "2026-09-28",
      status: "Checked-in",
    },
    {
      referenceNo: "RES-002",
      guestName: "Maria Santos",
      room: "Room 203",
      checkIn: "2026-09-26",
      checkOut: "2026-09-30",
      status: "Confirmed",
    },
    {
      referenceNo: "RES-003",
      guestName: "Pedro Reyes",
      room: "Room 305",
      checkIn: "2026-09-27",
      checkOut: "2026-09-29",
      status: "Pending",
    },
    {
      referenceNo: "RES-004",
      guestName: "Ana Lopez",
      room: "Room 118",
      checkIn: "2026-09-27",
      checkOut: "2026-10-01",
      status: "Confirmed",
    },
    {
      referenceNo: "RES-005",
      guestName: "Carlos Ramos",
      room: "Room 206",
      checkIn: "2026-09-28",
      checkOut: "2026-10-02",
      status: "Pending",
    },
  ],

  todaysPayments: [
    {
      id: "PAY-001",
      guestName: "Maria Santos",
      referenceNo: "RES-002",
      method: "GCash",
      amount: 12000,
      status: "Paid",
    },
    {
      id: "PAY-002",
      guestName: "Juan Dela Cruz",
      referenceNo: "RES-001",
      method: "Card",
      amount: 7500,
      status: "Paid",
    },
    {
      id: "PAY-003",
      guestName: "Ana Lopez",
      referenceNo: "RES-004",
      method: "Maya",
      amount: 5000,
      status: "Paid",
    },
  ],
};

export function formatCurrency(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

export function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
