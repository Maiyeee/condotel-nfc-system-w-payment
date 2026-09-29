# Phase 7C Guests Backend

This package is an overlay for the existing `server/` folder from Phase 7A and Phase 7B.
It does not replace the whole project and it does not modify the React frontend.

## Purpose

Phase 7C moves the Guests domain to the server-side data layer. The API stores guest records in SQLite instead of relying on the frontend's in-memory `INITIAL_GUESTS` array.

The current Guests UI uses these fields:

- `id`
- `name`
- `email`
- `phone`
- `idNumber`
- `status`
- `createdAt`
- `reservations`

The backend returns the same core field names. It also returns `version`, `updatedAt`, and `address` for backend data integrity and later integration.

## Added migration

`db/migrations/003_guests_backend.sql`

Adds:

- `guests.id_number`
- ID-number search index
- case-insensitive unique email index
- case-insensitive unique ID-number index

Do not delete migration 001 or 002.

## Guest API

### List guests

`GET /api/guests`

Query parameters:

- `page`
- `limit`
- `search`
- `status=active|inactive`

Search checks name, email, phone, and ID number.

### Get guest

`GET /api/guests/:id`

Returns the guest and reservation history.

### Create guest

`POST /api/guests`

Example body:

```json
{
  "name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "phone": "09171234567",
  "idNumber": "PSA-0012345",
  "status": "active"
}
```

### Update guest

`PATCH /api/guests/:id`

`PUT /api/guests/:id` is also supported.

Updates require the current `version` value:

```json
{
  "version": 1,
  "phone": "09170000000",
  "status": "inactive"
}
```

A stale version returns HTTP 409 with `STALE_GUEST_VERSION`.

### Delete guest

`DELETE /api/guests/:id`

A guest with reservation history is not deleted. The API returns `GUEST_HAS_RESERVATIONS`; set the guest to `inactive` instead.

## Commands

From the existing `server` folder:

```bash
npm install
npm run migrate
npm run seed
npm run test:guests
npm run dev
```

Useful browser checks after the server starts:

- `http://localhost:4000/api/guests`
- `http://localhost:4000/api/guests?status=active`
- `http://localhost:4000/api/guests?search=Juan`

## Phase boundary

This phase does not add authentication, encryption, PayMongo, NFC, ESP32, Rooms backend changes, Reservations backend changes, or React Guests API integration.
