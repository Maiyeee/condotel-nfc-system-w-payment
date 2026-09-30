-- Phase 7D: Rooms backend
-- Strengthens room lookup and uniqueness rules used by the Rooms API.

CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_room_number_unique_ci
  ON rooms(lower(trim(room_number)));

CREATE INDEX IF NOT EXISTS idx_rooms_name_ci
  ON rooms(lower(name));

CREATE INDEX IF NOT EXISTS idx_rooms_type_status
  ON rooms(type, status);

CREATE INDEX IF NOT EXISTS idx_rooms_rate_centavos
  ON rooms(rate_centavos);
