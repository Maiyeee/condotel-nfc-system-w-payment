# Phase 7 Acceptance Checklist

## Environment

- [ ] `server/.env` exists.
- [ ] `DB_PATH` points to the intended SQLite database.
- [ ] `CORS_ORIGIN` matches the React development origin.
- [ ] Node.js 20 or newer is installed.

## Database

- [ ] Migrations 001 through 006 are applied.
- [ ] Applied migration checksums match the migration files.
- [ ] SQLite `integrity_check` returns `ok`.
- [ ] Foreign-key check returns no problems.
- [ ] WAL mode is enabled.
- [ ] Data survives backend restart.

## Guests

- [ ] Guests load from `/api/guests`.
- [ ] Add Guest writes to SQLite.
- [ ] Edit Guest increments `version`.
- [ ] Duplicate email and ID number are rejected.
- [ ] Guest deletion is blocked when reservation history exists.

## Rooms

- [ ] Rooms load from `/api/rooms`.
- [ ] Add Room writes to SQLite.
- [ ] Duplicate room number is rejected.
- [ ] Maintenance and Out of Service rooms are excluded from stay availability.
- [ ] Room deletion is blocked when reservation history exists.

## Reservations and charges

- [ ] Reservation uses canonical Guest and Room IDs.
- [ ] Overlapping active reservation is rejected.
- [ ] Adjacent reservation is accepted.
- [ ] Room-rate charge is created automatically.
- [ ] Room/date changes recalculate the room-rate charge.
- [ ] Manual charges and discounts update the reservation total.
- [ ] Stale reservation and charge edits are rejected.

## Frontend consistency

- [ ] Frontend Guests match `/api/guests` and SQLite.
- [ ] Frontend Rooms match `/api/rooms` and SQLite.
- [ ] Frontend Reservations match `/api/reservations` and SQLite.
- [ ] Records remain after browser refresh and backend restart.

## Data migration

- [ ] Legacy localStorage export was reviewed before import, if legacy records existed.
- [ ] SQLite backup was created before the real import.
- [ ] Migration verification passes.
- [ ] Old Payments and Transactions were not imported as verified payments.

## Handover commands

- [ ] `npm run phase7:verify`
- [ ] `npm run test:phase7-handover`
- [ ] `npm test`
- [ ] Start backend with `npm run dev`
- [ ] `npm run phase7:smoke`
- [ ] `npm run phase7:handover`

Phase 7 is ready for handover only when required checks pass and unresolved Phase 7 defects are documented.
