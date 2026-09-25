export const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit / Debit Card",
    shortLabel: "Card",
    description: "Secure card payment through the configured provider.",
  },
  {
    id: "gcash",
    label: "GCash",
    shortLabel: "GCash",
    description: "Pay using a GCash checkout flow.",
  },
  {
    id: "maya",
    label: "Maya",
    shortLabel: "Maya",
    description: "Pay using a Maya checkout flow.",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    shortLabel: "Bank Transfer",
    description: "Record a bank transfer against the reservation.",
  },
];

export const DEFAULT_RESERVATIONS = [
  {
    id: "res-001",
    referenceNo: "RES-001",
    guestName: "Juan Dela Cruz",
    room: "Room 101",
    checkIn: "2026-09-25",
    checkOut: "2026-09-28",
    totalAmount: 7500,
    paidAmount: 0,
  },
  {
    id: "res-002",
    referenceNo: "RES-002",
    guestName: "Maria Santos",
    room: "Room 203",
    checkIn: "2026-09-26",
    checkOut: "2026-09-30",
    totalAmount: 12000,
    paidAmount: 0,
  },
  {
    id: "res-003",
    referenceNo: "RES-003",
    guestName: "Pedro Reyes",
    room: "Room 305",
    checkIn: "2026-09-27",
    checkOut: "2026-09-29",
    totalAmount: 6000,
    paidAmount: 0,
  },
  {
    id: "res-004",
    referenceNo: "RES-004",
    guestName: "Ana Lopez",
    room: "Room 118",
    checkIn: "2026-09-27",
    checkOut: "2026-10-01",
    totalAmount: 12000,
    paidAmount: 0,
  },
  {
    id: "res-005",
    referenceNo: "RES-005",
    guestName: "Carlos Ramos",
    room: "Room 206",
    checkIn: "2026-09-28",
    checkOut: "2026-10-02",
    totalAmount: 18000,
    paidAmount: 0,
  },
];

export const DEFAULT_PAYMENTS = [
  {
    id: "pay-001",
    reservationId: "res-002",
    referenceNo: "PAY-001",
    reservationReference: "RES-002",
    guestName: "Maria Santos",
    amount: 12000,
    method: "gcash",
    status: "Paid",
    providerRef: "GC-8F21A7",
    createdAt: "2026-09-25T09:10:00.000Z",
  },
  {
    id: "pay-002",
    reservationId: "res-001",
    referenceNo: "PAY-002",
    reservationReference: "RES-001",
    guestName: "Juan Dela Cruz",
    amount: 7500,
    method: "card",
    status: "Paid",
    providerRef: "CARD-54KD91",
    createdAt: "2026-09-25T10:05:00.000Z",
  },
  {
    id: "pay-003",
    reservationId: "res-004",
    referenceNo: "PAY-003",
    reservationReference: "RES-004",
    guestName: "Ana Lopez",
    amount: 5000,
    method: "maya",
    status: "Paid",
    providerRef: "MY-2K91XZ",
    createdAt: "2026-09-25T11:20:00.000Z",
  },
];

export function formatCurrency(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

export function formatDateTime(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getPaymentMethodLabel(methodId) {
  return (
    PAYMENT_METHODS.find((method) => method.id === methodId)?.shortLabel ??
    methodId
  );
}
