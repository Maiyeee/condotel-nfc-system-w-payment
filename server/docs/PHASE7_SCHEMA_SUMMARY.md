# Phase 7 Database Schema Summary

SQLite database path comes from `DB_PATH`. The default development path is `./data/condotel.sqlite` from the server folder.

## Operational tables

### guests

Stores the canonical guest ID, contact fields, status, optimistic version, and timestamps.

### rooms

Stores the canonical room ID, unique room number, type, nightly rate in integer centavos, service status, optimistic version, and timestamps.

### reservations

Links one guest and one room. Stores hotel stay dates, reservation status, notes, version, and timestamps. Foreign keys protect guest and room relationships.

### reservation_charges

Stores the immutable pricing snapshot lines and manual charges associated with a reservation. Amounts are stored in integer centavos. The room-rate line uses `source = room_rate`.

## Database support tables

### schema_migrations

Records applied migration filenames and SHA-256 checksums. Applied migration SQL files must remain unchanged.

### database_metadata

Stores non-secret schema metadata.

### data_migration_runs

Records each Phase 7G legacy browser-data import.

### data_migration_items

Records inserted, matched, skipped, and deferred items from a migration run.

## SQLite settings

- Foreign keys: ON
- Journal mode: WAL
- Synchronous mode: FULL
- Busy timeout: at least 5000 ms

## Phase 7 migrations

1. `001_phase7_foundation.sql`
2. `002_sqlite_foundation.sql`
3. `003_guests_backend.sql`
4. `004_rooms_backend.sql`
5. `005_reservations_charges.sql`
6. `006_data_migration.sql`

Phase 7H does not add a database migration.
