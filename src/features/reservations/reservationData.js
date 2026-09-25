export const RESERVATION_STATUSES = [
  "Pending",
  "Confirmed",
  "Checked-in",
  "Checked-out",
];

export const DEMO_GUESTS = [
  { id: "guest-001", name: "Juan Dela Cruz", email: "juan@gmail.com" },
  { id: "guest-002", name: "Maria Santos", email: "maria@gmail.com" },
  { id: "guest-003", name: "Pedro Reyes", email: "pedro@gmail.com" },
  { id: "guest-004", name: "Ana Lopez", email: "ana@gmail.com" },
  { id: "guest-005", name: "Carlos Ramos", email: "carlos@gmail.com" },
];

export const DEMO_ROOMS = [
  { id: "room-101", name: "Room 101", type: "Deluxe Room", rate: 2500 },
  { id: "room-102", name: "Room 102", type: "Deluxe Room", rate: 2500 },
  { id: "room-103", name: "Room 103", type: "Superior Room", rate: 3000 },
  { id: "room-104", name: "Room 104", type: "Superior Room", rate: 3000 },
  { id: "room-105", name: "Room 105", type: "Suite", rate: 4500 },
  { id: "room-106", name: "Room 106", type: "Suite", rate: 4500 },
];

export const DEFAULT_RESERVATIONS = [
  {
    id: "res-001",
    referenceNo: "RES-001",
    guestId: "guest-001",
    roomId: "room-101",
    checkIn: "2026-09-25",
    checkOut: "2026-09-28",
    status: "Checked-in",
    createdAt: "2026-09-20T08:30:00.000Z",
  },
  {
    id: "res-002",
    referenceNo: "RES-002",
    guestId: "guest-002",
    roomId: "room-203",
    checkIn: "2026-09-26",
    checkOut: "2026-09-30",
    status: "Confirmed",
    createdAt: "2026-09-21T09:15:00.000Z",
  },
  {
    id: "res-003",
    referenceNo: "RES-003",
    guestId: "guest-003",
    roomId: "room-305",
    checkIn: "2026-09-27",
    checkOut: "2026-09-29",
    status: "Pending",
    createdAt: "2026-09-22T10:45:00.000Z",
  },
  {
    id: "res-004",
    referenceNo: "RES-004",
    guestId: "guest-004",
    roomId: "room-104",
    checkIn: "2026-09-27",
    checkOut: "2026-10-01",
    status: "Confirmed",
    createdAt: "2026-09-22T13:20:00.000Z",
  },
  {
    id: "res-005",
    referenceNo: "RES-005",
    guestId: "guest-005",
    roomId: "room-105",
    checkIn: "2026-09-28",
    checkOut: "2026-10-02",
    status: "Pending",
    createdAt: "2026-09-23T14:00:00.000Z",
  },
];
