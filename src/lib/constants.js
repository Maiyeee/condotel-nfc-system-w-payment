export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
}

// Each nav item declares which roles can see it. Staff gets an
// operational subset (no Reports/Settings); Admin sees everything.
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: 'Guests', path: '/guests', icon: 'Users', roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: 'Rooms', path: '/rooms', icon: 'BedDouble', roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: 'Reservations', path: '/reservations', icon: 'CalendarCheck', roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: 'NFC Management', path: '/nfc', icon: 'Nfc', roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: 'Payments', path: '/payments', icon: 'CreditCard', roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: 'Transactions', path: '/transactions', icon: 'Receipt', roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: 'Reports', path: '/reports', icon: 'BarChart3', roles: [ROLES.ADMIN] },
  { label: 'Settings', path: '/settings', icon: 'Settings', roles: [ROLES.ADMIN] },
]

// Shared status -> color mapping so every StatusBadge across the app
// (rooms, reservations, payments, nfc cards) looks consistent.
export const STATUS_STYLES = {
  available: 'bg-success-50 text-success-600',
  confirmed: 'bg-info-50 text-info-600',
  'checked in': 'bg-success-50 text-success-600',
  'checked out': 'bg-slate-100 text-slate-600',
  pending: 'bg-warning-50 text-warning-600',
  occupied: 'bg-danger-50 text-danger-600',
  maintenance: 'bg-warning-50 text-warning-600',
  active: 'bg-success-50 text-success-600',
  inactive: 'bg-slate-100 text-slate-600',
  paid: 'bg-success-50 text-success-600',
  failed: 'bg-danger-50 text-danger-600',
  cancelled: 'bg-danger-50 text-danger-600',
}
