# Phase 7E Reservations & Charges Backend

This package builds on Phase 7A through Phase 7D. It adds the dedicated Reservations and Charges backend without changing previously applied migrations.

## Main behavior

- Reservation CRUD through SQLite.
- Search and filters by status, guest, room, and stay-date window.
- Room overlap protection inside a SQLite transaction.
- Optimistic reservation versions to reject stale updates.
- Automatic room-rate charge snapshot when a reservation is created.
- Room-rate snapshot refresh when room or stay dates change before payment integration.
- Manual charges, discounts, and adjustments.
- Optimistic charge versions.
- Protected system room-rate charge.
- Charge totals stored and calculated as integer centavos.
- Reservation detail includes charges and charge totals.

## Routes

### Reservations

- `GET /api/reservations`
- `GET /api/reservations/summary`
- `GET /api/reservations/:id`
- `POST /api/reservations`
- `PATCH /api/reservations/:id`
- `PUT /api/reservations/:id`
- `DELETE /api/reservations/:id`

Filters:

- `?search=`
- `?status=`
- `?guestId=`
- `?roomId=`
- `?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Charges

- `GET /api/reservations/:reservationId/charges`
- `POST /api/reservations/:reservationId/charges`
- `GET /api/charges/:id`
- `PATCH /api/charges/:id`
- `PUT /api/charges/:id`
- `DELETE /api/charges/:id`

Manual `chargeType` values are `Charge`, `Discount`, and `Adjustment`. The backend creates `Room` charges itself.

## Placement

Copy the included `server` folder into the root of the Condotel project and merge it with the existing `server` folder.

Do not replace or edit migrations 001 through 004. The only new migration in this package is:

`server/db/migrations/005_reservations_charges.sql`

## Commands

From the existing `server` folder:

```bash
npm install
npm run migrate
npm run db:verify
npm run test:reservations
npm run dev
```

The backend remains at `http://localhost:4000/api`.
