// TEMPORARY in-memory mock data so the Guests module can be built and
// tested before the backend (Phase 7 in the plan) exists. Once
// `GET/POST/PUT/DELETE /guests` is live, replace the functions below
// with `apiClient` calls — GuestsPage only talks to this file, so
// nothing else should need to change.

export const INITIAL_GUESTS = [
  {
    id: 1,
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@gmail.com',
    phone: '0917 123 4567',
    idNumber: 'PSA-0012345',
    status: 'active',
    createdAt: '2025-03-12',
    reservations: [
      { id: 'RES-001', room: 'Room 101', checkIn: '2025-04-25', checkOut: '2025-04-28', status: 'checked in' },
    ],
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    phone: '0917 987 6543',
    idNumber: 'PSA-0012346',
    status: 'active',
    createdAt: '2025-03-15',
    reservations: [
      { id: 'RES-002', room: 'Room 203', checkIn: '2025-04-26', checkOut: '2025-04-30', status: 'confirmed' },
    ],
  },
  {
    id: 3,
    name: 'Pedro Reyes',
    email: 'pedro.reyes@gmail.com',
    phone: '0917 345 6789',
    idNumber: 'PSA-0012347',
    status: 'active',
    createdAt: '2025-03-18',
    reservations: [
      { id: 'RES-003', room: 'Room 305', checkIn: '2025-04-27', checkOut: '2025-04-29', status: 'pending' },
    ],
  },
  {
    id: 4,
    name: 'Ana Lopez',
    email: 'ana.lopez@gmail.com',
    phone: '0917 560 7901',
    idNumber: 'PSA-0012348',
    status: 'active',
    createdAt: '2025-03-20',
    reservations: [
      { id: 'RES-004', room: 'Room 118', checkIn: '2025-04-27', checkOut: '2025-04-31', status: 'confirmed' },
    ],
  },
  {
    id: 5,
    name: 'Carlos Ramos',
    email: 'carlos.ramos@gmail.com',
    phone: '0917 456 7891',
    idNumber: 'PSA-0012349',
    status: 'active',
    createdAt: '2025-03-22',
    reservations: [
      { id: 'RES-005', room: 'Room 206', checkIn: '2025-04-28', checkOut: '2025-05-02', status: 'pending' },
    ],
  },
  {
    id: 6,
    name: 'Liza Fernandez',
    email: 'liza.fernandez@gmail.com',
    phone: '0918 224 5566',
    idNumber: 'PSA-0012350',
    status: 'inactive',
    createdAt: '2025-02-02',
    reservations: [
      { id: 'RES-006', room: 'Room 104', checkIn: '2025-02-10', checkOut: '2025-02-12', status: 'checked out' },
    ],
  },
  {
    id: 7,
    name: 'Mark Villanueva',
    email: 'mark.villanueva@gmail.com',
    phone: '0919 334 2211',
    idNumber: 'PSA-0012351',
    status: 'active',
    createdAt: '2025-03-28',
    reservations: [],
  },
  {
    id: 8,
    name: 'Grace Tan',
    email: 'grace.tan@gmail.com',
    phone: '0917 771 9933',
    idNumber: 'PSA-0012352',
    status: 'active',
    createdAt: '2025-03-30',
    reservations: [
      { id: 'RES-007', room: 'Room 105', checkIn: '2025-05-01', checkOut: '2025-05-04', status: 'confirmed' },
    ],
  },
  {
    id: 9,
    name: 'Rico Aquino',
    email: 'rico.aquino@gmail.com',
    phone: '0920 112 3344',
    idNumber: 'PSA-0012353',
    status: 'inactive',
    createdAt: '2025-01-14',
    reservations: [],
  },
  {
    id: 10,
    name: 'Bea Castillo',
    email: 'bea.castillo@gmail.com',
    phone: '0917 665 4433',
    idNumber: 'PSA-0012354',
    status: 'active',
    createdAt: '2025-04-02',
    reservations: [
      { id: 'RES-008', room: 'Room 203', checkIn: '2025-05-05', checkOut: '2025-05-06', status: 'pending' },
    ],
  },
  {
    id: 11,
    name: 'Noel Bautista',
    email: 'noel.bautista@gmail.com',
    phone: '0918 887 6655',
    idNumber: 'PSA-0012355',
    status: 'active',
    createdAt: '2025-04-05',
    reservations: [],
  },
  {
    id: 12,
    name: 'Ivy Mercado',
    email: 'ivy.mercado@gmail.com',
    phone: '0919 998 7766',
    idNumber: 'PSA-0012356',
    status: 'active',
    createdAt: '2025-04-08',
    reservations: [
      { id: 'RES-009', room: 'Room 106', checkIn: '2025-05-10', checkOut: '2025-05-12', status: 'confirmed' },
    ],
  },
]

export const emptyGuest = {
  name: '',
  email: '',
  phone: '',
  idNumber: '',
  status: 'active',
}
