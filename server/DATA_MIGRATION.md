# Phase 7G - Data Migration

Phase 7G migrates reviewed legacy browser data into the Phase 7 SQLite backend without changing migrations 001-005.

## Scope

Imported into SQLite:
- Guests
- Rooms
- Reservations
- One room-rate charge for each newly imported reservation

Deferred and not imported as verified data:
- Payments
- Transactions
- NFC data
- Settings
- Notifications
- Reports

This is intentional. Payment records from browser localStorage are not trusted as verified provider payments.

## Files

- `public/tools/legacy-localstorage-export.html` exports Condotel-related browser localStorage.
- `db/migrations/006_data_migration.sql` adds migration audit tables only.
- `src/dataMigration/reviewLegacyExport.js` normalizes and reports candidates without changing SQLite.
- `src/dataMigration/backupDatabase.js` creates a SQLite backup before import.
- `src/dataMigration/importLegacyData.js` deduplicates, maps IDs, validates relationships, rejects overlaps, imports valid rows, and logs every decision.
- `src/dataMigration/verifyDataMigration.js` checks integrity, foreign keys, row counts, and latest migration run.
- `test/data-migration.test.js` validates the Phase 7G workflow.

## Workflow

1. Merge this ZIP into the project root.
2. From `server`, run `npm install` and `npm run migrate`.
3. Start frontend only, then open `http://localhost:5173/tools/legacy-localstorage-export.html`.
4. Export the JSON and copy it into `server/data-migration/inbox/`.
5. Stop the backend before backup/import.
6. Run review first:

   `npm run data:migrate:review -- ./data-migration/inbox/<file>.json`

7. Inspect the JSON report in `server/data-migration/reports/`.
8. Create a backup:

   `npm run data:migrate:backup`

9. Import the reviewed export:

   `npm run data:migrate:import -- ./data-migration/inbox/<file>.json`

10. Verify:

   `npm run data:migrate:verify`

11. Run tests:

   `npm run test:data-migration`

12. Start the backend again:

   `npm run dev`

## Safety behavior

- The same export SHA-256 cannot be committed twice.
- Existing guests are matched by email or ID number.
- Existing rooms are matched by room number.
- Existing reservations are matched by reference number or exact guest/room/stay dates.
- Active overlapping reservations are skipped and logged.
- Missing guest/room relationships are skipped and logged.
- Earlier SQL migrations are not replaced or edited.
