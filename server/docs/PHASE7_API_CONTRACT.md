# Phase 7 API Contract

Base URL: `http://localhost:4000/api`

## Health

- `GET /health`

## Guests

- `GET /guests`
- `GET /guests/:id`
- `POST /guests`
- `PATCH /guests/:id`
- `PUT /guests/:id`
- `DELETE /guests/:id`

Guest updates require the current `version` value.

## Rooms

- `GET /rooms`
- `GET /rooms/summary`
- `GET /rooms/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD`
- `GET /rooms/:id`
- `POST /rooms`
- `PATCH /rooms/:id`
- `PUT /rooms/:id`
- `DELETE /rooms/:id`

Room updates require the current `version` value.

## Reservations

- `GET /reservations`
- `GET /reservations/summary`
- `GET /reservations/:id`
- `POST /reservations`
- `PATCH /reservations/:id`
- `PUT /reservations/:id`
- `DELETE /reservations/:id`

The server rejects overlapping active stays for the same room. Adjacent stays are allowed. Reservation updates require the current `version` value.

## Reservation charges

- `GET /reservations/:reservationId/charges`
- `POST /reservations/:reservationId/charges`
- `GET /charges/:id`
- `PATCH /charges/:id`
- `PUT /charges/:id`
- `DELETE /charges/:id`

The automatic room-rate charge is managed by the reservation service. Manual edits to the automatic room-rate line are rejected.

## Phase 7 response shape

Successful collection responses return `data` and usually `meta`. Successful single-record responses return `data`. Validation and business-rule failures return the common API error envelope with an error code and request ID.
