-- Phase 7B - SQLite Foundation
-- This migration builds on 001_phase7_foundation.sql from Phase 7A.
-- It adds SQLite-specific metadata, focused indexes, and automatic timestamps.

CREATE TABLE IF NOT EXISTS database_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO database_metadata (key, value)
VALUES ('schema_name', 'condotel')
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');

INSERT INTO database_metadata (key, value)
VALUES ('phase', '7B-sqlite-foundation')
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');

-- Speeds up the date-overlap query used before creating or changing
-- Pending, Confirmed, and Checked-in reservations.
CREATE INDEX IF NOT EXISTS idx_reservations_active_room_dates
  ON reservations(room_id, check_in, check_out)
  WHERE status IN ('Pending', 'Confirmed', 'Checked-in');

CREATE INDEX IF NOT EXISTS idx_reservation_charges_reservation_created
  ON reservation_charges(reservation_id, created_at);

-- Keep updated_at correct even when a row is changed outside a repository.
CREATE TRIGGER IF NOT EXISTS trg_guests_touch_updated_at
AFTER UPDATE ON guests
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE guests
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_rooms_touch_updated_at
AFTER UPDATE ON rooms
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE rooms
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reservations_touch_updated_at
AFTER UPDATE ON reservations
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE reservations
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;
