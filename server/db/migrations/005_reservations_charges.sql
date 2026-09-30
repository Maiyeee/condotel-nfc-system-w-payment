-- Phase 7E: Reservations & Charges backend
-- Builds on 001-004 without changing any previously applied migration.
-- Adds charge classification, optimistic versions, pricing-source metadata,
-- reservation/charge indexes, and updated timestamps for charge edits.

ALTER TABLE reservation_charges
  ADD COLUMN charge_type TEXT NOT NULL DEFAULT 'Charge'
  CHECK (charge_type IN ('Room', 'Charge', 'Discount', 'Adjustment'));

ALTER TABLE reservation_charges
  ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'
  CHECK (source IN ('room_rate', 'manual', 'system'));

ALTER TABLE reservation_charges
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1
  CHECK (version >= 1);

ALTER TABLE reservation_charges
  ADD COLUMN updated_at TEXT;

UPDATE reservation_charges
SET updated_at = created_at
WHERE updated_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_charges_one_room_rate
  ON reservation_charges(reservation_id)
  WHERE source = 'room_rate';

CREATE INDEX IF NOT EXISTS idx_reservation_charges_type
  ON reservation_charges(reservation_id, charge_type);

CREATE INDEX IF NOT EXISTS idx_reservations_guest_dates
  ON reservations(guest_id, check_in, check_out);

CREATE INDEX IF NOT EXISTS idx_reservations_status_checkin
  ON reservations(status, check_in);

CREATE TRIGGER IF NOT EXISTS trg_reservation_charges_touch_updated_at
AFTER UPDATE ON reservation_charges
FOR EACH ROW
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
  UPDATE reservation_charges
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;

INSERT INTO database_metadata (key, value)
VALUES ('phase_reservations_charges', '7E-reservations-charges')
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
