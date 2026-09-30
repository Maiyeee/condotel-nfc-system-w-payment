-- Phase 7G: Data migration
-- Adds a durable audit trail for one-time imports from legacy browser storage.
-- This migration does not alter migrations 001-005 and does not create a payment ledger.

CREATE TABLE IF NOT EXISTS data_migration_runs (
  id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_sha256 TEXT NOT NULL,
  source_origin TEXT NOT NULL DEFAULT '',
  exported_at TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL
    CHECK (status IN ('running', 'completed', 'failed')),
  started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at TEXT,
  summary_json TEXT NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_data_migration_runs_completed_source
  ON data_migration_runs(source_sha256)
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_data_migration_runs_started
  ON data_migration_runs(started_at DESC);

CREATE TABLE IF NOT EXISTS data_migration_items (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('guest', 'room', 'reservation', 'charge', 'storage_key')),
  source_key TEXT NOT NULL DEFAULT '',
  legacy_id TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL
    CHECK (action IN ('inserted', 'matched', 'skipped', 'deferred')),
  reason TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (run_id) REFERENCES data_migration_runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_data_migration_items_run
  ON data_migration_items(run_id, entity_type, action);

INSERT INTO database_metadata (key, value)
VALUES ('phase_data_migration', '7G-data-migration')
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
