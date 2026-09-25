export const DEFAULT_TRANSACTIONS = [
  {
    id: "txn-001",
    transactionNo: "TXN-20260925-001",
    paymentReference: "PAY-001",
    reservationReference: "RES-002",
    guestName: "Maria Santos",
    room: "Room 203",
    amount: 12000,
    method: "GCash",
    status: "Paid",
    providerReference: "GC-8F21A7",
    createdAt: "2026-09-25T09:10:00.000Z",
  },
  {
    id: "txn-002",
    transactionNo: "TXN-20260925-002",
    paymentReference: "PAY-002",
    reservationReference: "RES-001",
    guestName: "Juan Dela Cruz",
    room: "Room 101",
    amount: 7500,
    method: "Card",
    status: "Paid",
    providerReference: "CARD-54KD91",
    createdAt: "2026-09-25T10:05:00.000Z",
  },
  {
    id: "txn-003",
    transactionNo: "TXN-20260925-003",
    paymentReference: "PAY-003",
    reservationReference: "RES-004",
    guestName: "Ana Lopez",
    room: "Room 118",
    amount: 5000,
    method: "Maya",
    status: "Paid",
    providerReference: "MY-2K91XZ",
    createdAt: "2026-09-25T11:20:00.000Z",
  },
  {
    id: "txn-004",
    transactionNo: "TXN-20260925-004",
    paymentReference: "PAY-004",
    reservationReference: "RES-005",
    guestName: "Carlos Ramos",
    room: "Room 206",
    amount: 8000,
    method: "Bank Transfer",
    status: "Pending",
    providerReference: "BT-91K2PL",
    createdAt: "2026-09-25T13:45:00.000Z",
  },
  {
    id: "txn-005",
    transactionNo: "TXN-20260925-005",
    paymentReference: "PAY-005",
    reservationReference: "RES-003",
    guestName: "Pedro Reyes",
    room: "Room 305",
    amount: 6000,
    method: "Card",
    status: "Failed",
    providerReference: "CARD-FAIL-11",
    createdAt: "2026-09-25T15:30:00.000Z",
  },
];

export const STATUS_FILTERS = [
  "All",
  "Paid",
  "Pending",
  "Failed",
  "Refunded",
];

export function formatCurrency(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateTime(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getStatusClass(status) {
  return {
    Paid: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700",
    Failed: "bg-red-50 text-red-700",
    Refunded: "bg-slate-100 text-slate-600",
  }[status] || "bg-slate-100 text-slate-600";
}
