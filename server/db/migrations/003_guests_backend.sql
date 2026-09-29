-- Phase 7C: Guests backend
-- Adds the guest ID-number field required by the current Guests UI and
-- database indexes used by guest search and duplicate checks.

ALTER TABLE guests ADD COLUMN id_number TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_guests_id_number
  ON guests(id_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_email_unique_ci
  ON guests(lower(email))
  WHERE trim(email) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_id_number_unique_ci
  ON guests(upper(id_number))
  WHERE trim(id_number) <> '';
