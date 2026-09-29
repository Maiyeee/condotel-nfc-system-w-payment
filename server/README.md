# Condotel Phase 7 Backend Foundation

This folder contains only Phase 7 Backend Foundation work for the existing Condotel React project.

Included:

- Node.js and Express API
- SQLite database
- Versioned SQL migration
- Guest API
- Room API
- Reservation API
- Reservation charge API
- Health endpoint
- Request validation
- Error handling and request IDs
- Foreign keys
- SQLite WAL mode
- `synchronous=FULL`
- room-date overlap protection
- reservation optimistic version checks
- development seed data
- Phase 7 tests

Excluded:

- authentication
- permissions
- password hashing
- AES encryption
- PayMongo
- payment webhooks
- NFC cards
- ESP32 devices

## Install into the existing repository

Place the included `server` folder in the root of:

```text
condotel-nfc-system-w-payment/
  public/
  src/
  server/
  package.json
  vite.config.js
```

The existing frontend repository already uses this backend base URL:

```text
http://localhost:4000/api
```

## Setup

Open a terminal:

```bash
cd server
npm install
```

Create `.env`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Command Prompt:

```cmd
copy .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Create the SQLite schema:

```bash
npm run migrate
```

Optional development seed:

```bash
npm run seed
```

Run the API:

```bash
npm run dev
```

Health check:

```text
GET http://localhost:4000/api/health
```

## API routes

Guests:

```text
GET    /api/guests
GET    /api/guests/:id
POST   /api/guests
PATCH  /api/guests/:id
DELETE /api/guests/:id
```

Rooms:

```text
GET   /api/rooms
GET   /api/rooms/:id
POST  /api/rooms
PATCH /api/rooms/:id
```

Reservations:

```text
GET    /api/reservations
GET    /api/reservations/:id
POST   /api/reservations
PATCH  /api/reservations/:id
DELETE /api/reservations/:id
```

Charges:

```text
GET  /api/reservations/:reservationId/charges
POST /api/reservations/:reservationId/charges
GET  /api/charges/:id
```

## Example guest

```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "09171234567",
  "address": "Calbayog City",
  "status": "Active"
}
```

## Example room

Money is stored as integer centavos.

PHP 2,500.00 equals `250000`.

```json
{
  "roomNumber": "101",
  "name": "Room 101",
  "type": "Deluxe",
  "rateCentavos": 250000,
  "status": "Available"
}
```

## Example reservation

```json
{
  "guestId": "guest-001",
  "roomId": "room-101",
  "checkIn": "2026-10-10",
  "checkOut": "2026-10-12",
  "status": "Confirmed",
  "notes": "Late arrival"
}
```

The backend rejects overlapping active stays for the same room.

It uses:

```text
new_check_in < existing_check_out
AND
new_check_out > existing_check_in
```

Adjacent stays are allowed.

Reservation PATCH requests require the current `version`.

```json
{
  "version": 1,
  "checkOut": "2026-10-13"
}
```

A stale version returns HTTP 409.

## Example charge

```json
{
  "description": "Room charge",
  "amountCentavos": 250000,
  "quantity": 2
}
```

## List query parameters

Guests and rooms:

```text
?page=1&limit=20&search=&status=
```

Reservations:

```text
?page=1&limit=20&search=&status=&guestId=&roomId=
```

## Error format

```json
{
  "error": {
    "code": "RESERVATION_OVERLAP",
    "message": "The room already has an overlapping active reservation.",
    "details": null,
    "requestId": "..."
  }
}
```

## Test

```bash
npm test
```

The tests verify the migration, foreign keys, overlap blocking, adjacent bookings, and stale reservation updates.

## SQLite file

Default location:

```text
server/data/condotel.sqlite
```

The database enables:

```text
foreign_keys = ON
journal_mode = WAL
synchronous = FULL
busy_timeout = 5000
```

## Migration rule

Do not edit a migration after it has been applied to a real database.

For later Phase 7 schema changes, add another numbered migration:

```text
002_example.sql
003_example.sql
```

Then run:

```bash
npm run migrate
```
