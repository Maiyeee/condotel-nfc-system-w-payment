# Phase 7D Rooms Backend

This package extends Phase 7A, 7B, and 7C. Copy the included `server` folder into the project root and merge it with the existing `server` folder.

## Scope

Phase 7D adds production-shaped backend behavior for the Rooms module only.

Included behavior:

- Room listing with pagination
- Search by room number, room name, or room type
- Filter by room status and room type
- Get one room with reservation history
- Create a room
- Update a room with optimistic version checking
- Delete a room only when no reservation history exists
- Case-insensitive room-number duplicate prevention
- Stay-date room availability lookup
- Room inventory summary counts
- SQLite indexes supporting room lookups
- Automated Phase 7D tests

## API routes

- `GET /api/rooms`
- `GET /api/rooms?search=201`
- `GET /api/rooms?status=Available&type=Deluxe`
- `GET /api/rooms/summary`
- `GET /api/rooms/availability?checkIn=2026-10-10&checkOut=2026-10-12`
- `GET /api/rooms/:id`
- `POST /api/rooms`
- `PATCH /api/rooms/:id`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`

## Migration order

Keep every earlier migration. The expected sequence after Phase 7D is:

1. `001_phase7_foundation.sql`
2. `002_sqlite_foundation.sql`
3. `003_guests_backend.sql`
4. `004_rooms_backend.sql`

## Commands

From the project root:

```powershell
cd server
npm install
npm run migrate
npm run seed
npm run db:verify
npm run test:rooms
npm run dev
```

## Update requests

Room updates require the current `version` value. Example:

```json
{
  "version": 1,
  "rateCentavos": 275000,
  "status": "Available"
}
```

If another request already changed the room, the API responds with `STALE_ROOM_VERSION` instead of overwriting the newer record.

## Money

Room rates remain stored as integer centavos.

PHP 2,500.00 is stored as:

```text
250000
```

## Availability

The availability endpoint excludes:

- Rooms in `Maintenance`
- Rooms in `Out of Service`
- Rooms with overlapping `Pending`, `Confirmed`, or `Checked-in` reservations

Date overlap uses the same half-open stay rule already used by the Phase 7 reservation foundation.
