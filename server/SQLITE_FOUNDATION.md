# Phase 7B - SQLite Foundation

This is an incremental package for the existing `server/` folder from Phase 7A Backend Foundation.

## Scope

This package contains SQLite Foundation work only:

- SQLite connection hardening
- foreign key enforcement
- WAL journal mode
- FULL synchronization
- 5-second busy timeout
- versioned migration checksums
- Phase 7B additive migration
- SQLite metadata
- focused reservation and charge indexes
- automatic `updated_at` triggers
- development seed protection
- integrity, foreign-key, migration, and reopen verification

It does not add authentication, encryption, PayMongo, NFC, ESP32, or frontend integration.

## Copy location

Copy the included `server` folder into the root of the existing project and allow the matching files inside `server` to replace the older Phase 7A versions.

Expected project structure:

```text
condotel-nfc-system-w-payment/
  public/
  src/
  server/
    db/
      migrations/
        001_phase7_foundation.sql
        002_sqlite_foundation.sql
    src/
      db/
        database.js
        migrate.js
        seed.js
        verify.js
    package.json
    SQLITE_FOUNDATION.md
  package.json
  vite.config.js
```

Do not delete `001_phase7_foundation.sql`. Migration 002 depends on the tables created by migration 001.

## Commands

From the project root:

```bash
cd server
npm install
npm run migrate
npm run seed
npm run db:verify
npm run dev
```

`npm run migrate` applies only migrations that have not been recorded in `schema_migrations`.

`npm run seed` is development-only and does not overwrite rows already using the same seed IDs.

`npm run db:verify` checks SQLite settings, required tables and indexes, foreign-key integrity, database integrity, recorded migrations, and reopening the persisted database file.

The SQLite file remains at the path configured by `DB_PATH`. With the supplied Phase 7A `.env`, it is:

```text
server/data/condotel.sqlite
```
