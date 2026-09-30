# Phase 7H Testing and Handover

Phase 7H closes the Backend and SQLite foundation work. It does not add a new application feature or SQL migration.

## Purpose

The package adds acceptance testing, a non-destructive database verification command, a live API smoke test, and a generated handover report.

## Added commands

```bash
npm run phase7:verify
npm run test:phase7-handover
npm run phase7:smoke
npm run phase7:handover
```

`npm run phase7:verify` checks the real configured SQLite database without inserting test records.

`npm run test:phase7-handover` uses a temporary SQLite database and validates the Phase 7 business rules.

`npm run phase7:smoke` expects the backend to already be running and checks the main read endpoints.

`npm run phase7:handover` writes a dated report under `server/handover/reports/`.

## Recommended final sequence

```bash
cd server
npm run migrate
npm run phase7:verify
npm run test:phase7-handover
npm test
npm run dev
```

Keep the server running. In another terminal:

```bash
cd server
npm run phase7:smoke
npm run phase7:handover
```

## Important migration rule

Do not edit migrations 001 through 006 after they have been applied. Phase 7H intentionally adds no `007` migration because testing and handover do not require a database schema change.

## Handover documents

- `docs/PHASE7_API_CONTRACT.md`
- `docs/PHASE7_SCHEMA_SUMMARY.md`
- `docs/PHASE7_ACCEPTANCE_CHECKLIST.md`
- generated reports under `handover/reports/`
