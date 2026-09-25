# Condotel NFC System with Payment

React + Vite frontend for a condotel management system with NFC-based
check-in/check-out and integrated cashless payments.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Zustand (client state / auth session)
- React Hook Form + Zod (forms & validation)
- Axios (API client)
- Lucide React (icons)

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and point `VITE_API_URL` at the backend once
it exists (Phase 7 of the plan below). Until then, auth uses a **mocked**
login (see `src/store/authStore.js`) with two demo accounts:

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@condotel.com  | admin123 |
| Staff | staff@condotel.com  | staff123 |

## Project structure

```
src/
  api/            # future API request modules (per resource)
  components/
    ui/           # reusable primitives (Button, Input, StatusBadge, StatCard...)
    layout/       # Sidebar, Topbar, AppShell
  features/       # one folder per domain module (auth, guests, rooms, ...)
  hooks/          # shared custom hooks
  lib/            # apiClient, constants, helpers
  routes/         # router config + route guards
  store/          # zustand stores
```

Each `features/<name>` folder owns its own pages/components for that
module (e.g. `features/reservations/ReservationsPage.jsx`), keeping
domains self-contained as the app grows.

## Development phases

1. **Foundation** — routing, layout shell, auth, role-based nav (this commit)
2. Core data modules — Guests, Rooms, Reservations
3. Dashboard — stats, occupancy chart, recent activity
4. Payments — provider integration, transactions, invoices
5. NFC — card management, check-in/check-out
6. Notifications, Reports, Settings
7. Backend hardening — security, rate limiting, role guard audit
