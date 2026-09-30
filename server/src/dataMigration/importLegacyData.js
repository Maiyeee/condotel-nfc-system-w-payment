import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from '../db/database.js'
import { runMigrations } from '../db/migrate.js'
import {
  cleanText,
  makeMigrationReference,
  newId,
  nightsBetween,
} from './helpers.js'
import { collectLegacyCandidates } from './normalizeLegacyData.js'
import { loadLegacyExport } from './readLegacyExport.js'

const __filename = fileURLToPath(import.meta.url)
const ACTIVE_STATUSES = ['Pending', 'Confirmed', 'Checked-in']

function assertPhase7GSchema() {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='data_migration_runs'").get()
  if (!table) throw new Error('Phase 7G schema is missing. Run npm run migrate first.')
}

function findExistingRun(sourceSha256) {
  return db.prepare(`
    SELECT id, source_name, started_at, completed_at
    FROM data_migration_runs
    WHERE source_sha256 = ? AND status = 'completed'
    LIMIT 1
  `).get(sourceSha256)
}

function insertRun(record) {
  db.prepare(`
    INSERT INTO data_migration_runs
      (id, source_name, source_sha256, source_origin, exported_at, status, summary_json)
    VALUES
      (@id, @sourceName, @sourceSha256, @sourceOrigin, @exportedAt, 'running', '{}')
  `).run(record)
}

function finishRun(id, status, summary) {
  db.prepare(`
    UPDATE data_migration_runs
    SET status = ?, completed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), summary_json = ?
    WHERE id = ?
  `).run(status, JSON.stringify(summary), id)
}

function logItem(runId, item) {
  db.prepare(`
    INSERT INTO data_migration_items
      (id, run_id, entity_type, source_key, legacy_id, target_id, action, reason, details_json)
    VALUES
      (@id, @runId, @entityType, @sourceKey, @legacyId, @targetId, @action, @reason, @detailsJson)
  `).run({
    id: newId('migration-item'),
    runId,
    entityType: item.entityType,
    sourceKey: item.sourceKey || '',
    legacyId: item.legacyId || '',
    targetId: item.targetId || '',
    action: item.action,
    reason: item.reason || '',
    detailsJson: JSON.stringify(item.details || {}),
  })
}

function findGuestMatch(guest) {
  if (guest.email) {
    const match = db.prepare('SELECT * FROM guests WHERE lower(email) = lower(?) LIMIT 1').get(guest.email)
    if (match) return match
  }
  if (guest.idNumber) {
    const match = db.prepare('SELECT * FROM guests WHERE upper(id_number) = upper(?) LIMIT 1').get(guest.idNumber)
    if (match) return match
  }
  return null
}

function findRoomMatch(room) {
  if (!room.roomNumber) return null
  return db.prepare(`
    SELECT * FROM rooms
    WHERE lower(trim(room_number)) = lower(trim(?))
    LIMIT 1
  `).get(room.roomNumber)
}

function findReservationMatch(reservation) {
  if (reservation.referenceNo) {
    const byReference = db.prepare('SELECT * FROM reservations WHERE reference_no = ? LIMIT 1').get(reservation.referenceNo)
    if (byReference) return byReference
  }
  return null
}

function resolveGuest(reservation, guestMap) {
  if (reservation.guestId) {
    const mapped = guestMap.get(reservation.guestId)
    if (mapped) return mapped
    const direct = db.prepare('SELECT id FROM guests WHERE id = ?').get(reservation.guestId)
    if (direct) return direct.id
  }
  if (reservation.guestEmail) {
    const match = db.prepare('SELECT id FROM guests WHERE lower(email) = lower(?) LIMIT 1').get(reservation.guestEmail)
    if (match) return match.id
  }
  if (reservation.guestName) {
    const matches = db.prepare('SELECT id FROM guests WHERE lower(name) = lower(?)').all(reservation.guestName)
    if (matches.length === 1) return matches[0].id
  }
  return ''
}

function resolveRoom(reservation, roomMap) {
  if (reservation.roomId) {
    const mapped = roomMap.get(reservation.roomId)
    if (mapped) return mapped
    const direct = db.prepare('SELECT id FROM rooms WHERE id = ?').get(reservation.roomId)
    if (direct) return direct.id
  }
  if (reservation.roomNumber) {
    const match = db.prepare(`
      SELECT id FROM rooms
      WHERE lower(trim(room_number)) = lower(trim(?))
      LIMIT 1
    `).get(reservation.roomNumber)
    if (match) return match.id
  }
  return ''
}

function findExactReservation({ guestId, roomId, checkIn, checkOut }) {
  return db.prepare(`
    SELECT * FROM reservations
    WHERE guest_id = ? AND room_id = ? AND check_in = ? AND check_out = ?
    LIMIT 1
  `).get(guestId, roomId, checkIn, checkOut)
}

function findOverlap({ roomId, checkIn, checkOut }) {
  const placeholders = ACTIVE_STATUSES.map(() => '?').join(', ')
  return db.prepare(`
    SELECT id, reference_no, check_in, check_out
    FROM reservations
    WHERE room_id = ?
      AND status IN (${placeholders})
      AND check_in < ?
      AND check_out > ?
    LIMIT 1
  `).get(roomId, ...ACTIVE_STATUSES, checkOut, checkIn)
}

function uniqueReference(preferred, legacyId, index) {
  let reference = cleanText(preferred) || makeMigrationReference(legacyId, index)
  let suffix = 1
  while (db.prepare('SELECT 1 FROM reservations WHERE reference_no = ?').get(reference)) {
    reference = `${makeMigrationReference(legacyId, index)}-${suffix}`
    suffix += 1
  }
  return reference
}

function importGuests(runId, candidates, guestMap, counters) {
  const insert = db.prepare(`
    INSERT INTO guests
      (id, name, email, phone, id_number, address, status)
    VALUES
      (@id, @name, @email, @phone, @idNumber, @address, @status)
  `)

  for (const candidate of candidates) {
    const guest = candidate.normalized
    if (candidate.issues.length) {
      counters.guests.skipped += 1
      logItem(runId, {
        entityType: 'guest', sourceKey: candidate.sourceKey, legacyId: guest.legacyId,
        action: 'skipped', reason: candidate.issues.join('; '), details: { name: guest.name, email: guest.email },
      })
      continue
    }

    const existing = findGuestMatch(guest)
    if (existing) {
      guestMap.set(guest.legacyId, existing.id)
      counters.guests.matched += 1
      logItem(runId, {
        entityType: 'guest', sourceKey: candidate.sourceKey, legacyId: guest.legacyId,
        targetId: existing.id, action: 'matched', reason: 'Matched existing guest by email or ID number.',
        details: { name: guest.name, email: guest.email },
      })
      continue
    }

    const id = newId('guest')
    insert.run({ id, ...guest })
    guestMap.set(guest.legacyId, id)
    counters.guests.inserted += 1
    logItem(runId, {
      entityType: 'guest', sourceKey: candidate.sourceKey, legacyId: guest.legacyId,
      targetId: id, action: 'inserted', reason: 'Imported legacy guest.', details: { name: guest.name, email: guest.email },
    })
  }
}

function importRooms(runId, candidates, roomMap, counters) {
  const insert = db.prepare(`
    INSERT INTO rooms
      (id, room_number, name, type, rate_centavos, status)
    VALUES
      (@id, @roomNumber, @name, @type, @rateCentavos, @status)
  `)

  for (const candidate of candidates) {
    const room = candidate.normalized
    if (candidate.issues.length) {
      counters.rooms.skipped += 1
      logItem(runId, {
        entityType: 'room', sourceKey: candidate.sourceKey, legacyId: room.legacyId,
        action: 'skipped', reason: candidate.issues.join('; '), details: { roomNumber: room.roomNumber },
      })
      continue
    }

    const existing = findRoomMatch(room)
    if (existing) {
      roomMap.set(room.legacyId, existing.id)
      counters.rooms.matched += 1
      logItem(runId, {
        entityType: 'room', sourceKey: candidate.sourceKey, legacyId: room.legacyId,
        targetId: existing.id, action: 'matched', reason: 'Matched existing room by room number.',
        details: { roomNumber: room.roomNumber },
      })
      continue
    }

    const id = newId('room')
    insert.run({ id, ...room })
    roomMap.set(room.legacyId, id)
    counters.rooms.inserted += 1
    logItem(runId, {
      entityType: 'room', sourceKey: candidate.sourceKey, legacyId: room.legacyId,
      targetId: id, action: 'inserted', reason: 'Imported legacy room.', details: { roomNumber: room.roomNumber },
    })
  }
}

function importReservations(runId, candidates, guestMap, roomMap, counters) {
  const insertReservation = db.prepare(`
    INSERT INTO reservations
      (id, reference_no, guest_id, room_id, check_in, check_out, status, notes)
    VALUES
      (@id, @referenceNo, @guestId, @roomId, @checkIn, @checkOut, @status, @notes)
  `)
  const insertCharge = db.prepare(`
    INSERT INTO reservation_charges
      (id, reservation_id, description, amount_centavos, quantity, charge_type, source, version, updated_at)
    VALUES
      (@id, @reservationId, @description, @amountCentavos, @quantity, 'Room', 'room_rate', 1,
       strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  `)

  candidates.forEach((candidate, index) => {
    const reservation = candidate.normalized
    if (candidate.issues.length) {
      counters.reservations.skipped += 1
      logItem(runId, {
        entityType: 'reservation', sourceKey: candidate.sourceKey, legacyId: reservation.legacyId,
        action: 'skipped', reason: candidate.issues.join('; '), details: { referenceNo: reservation.referenceNo },
      })
      return
    }

    const guestId = resolveGuest(reservation, guestMap)
    const roomId = resolveRoom(reservation, roomMap)
    if (!guestId || !roomId) {
      counters.reservations.skipped += 1
      logItem(runId, {
        entityType: 'reservation', sourceKey: candidate.sourceKey, legacyId: reservation.legacyId,
        action: 'skipped', reason: !guestId && !roomId ? 'Guest and room relationships could not be resolved.' : !guestId ? 'Guest relationship could not be resolved.' : 'Room relationship could not be resolved.',
        details: { referenceNo: reservation.referenceNo, guestId: reservation.guestId, roomId: reservation.roomId, roomNumber: reservation.roomNumber },
      })
      return
    }

    const existing = findReservationMatch(reservation) || findExactReservation({
      guestId, roomId, checkIn: reservation.checkIn, checkOut: reservation.checkOut,
    })
    if (existing) {
      counters.reservations.matched += 1
      logItem(runId, {
        entityType: 'reservation', sourceKey: candidate.sourceKey, legacyId: reservation.legacyId,
        targetId: existing.id, action: 'matched', reason: 'Matched an existing reservation by reference or exact stay.',
        details: { referenceNo: existing.reference_no },
      })
      return
    }

    if (ACTIVE_STATUSES.includes(reservation.status)) {
      const overlap = findOverlap({ roomId, checkIn: reservation.checkIn, checkOut: reservation.checkOut })
      if (overlap) {
        counters.reservations.skipped += 1
        logItem(runId, {
          entityType: 'reservation', sourceKey: candidate.sourceKey, legacyId: reservation.legacyId,
          action: 'skipped', reason: `Overlaps existing active reservation ${overlap.reference_no}.`,
          details: { overlapId: overlap.id, overlapReference: overlap.reference_no },
        })
        return
      }
    }

    const room = db.prepare('SELECT id, room_number, name, rate_centavos FROM rooms WHERE id = ?').get(roomId)
    const id = newId('reservation')
    const referenceNo = uniqueReference(reservation.referenceNo, reservation.legacyId, index)
    insertReservation.run({
      id,
      referenceNo,
      guestId,
      roomId,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      status: reservation.status,
      notes: reservation.notes,
    })

    const nights = nightsBetween(reservation.checkIn, reservation.checkOut)
    const amountCentavos = reservation.nightlyRateCentavos > 0
      ? reservation.nightlyRateCentavos
      : Number(room.rate_centavos || 0)
    insertCharge.run({
      id: newId('charge'),
      reservationId: id,
      description: `${room.name || `Room ${room.room_number}`} rate`,
      amountCentavos,
      quantity: nights,
    })

    counters.reservations.inserted += 1
    counters.charges.inserted += 1
    logItem(runId, {
      entityType: 'reservation', sourceKey: candidate.sourceKey, legacyId: reservation.legacyId,
      targetId: id, action: 'inserted', reason: 'Imported legacy reservation and generated a room-rate charge.',
      details: { referenceNo, guestId, roomId, nights, amountCentavos },
    })
  })
}

function logDeferredKeys(runId, deferredKeys, counters) {
  for (const item of deferredKeys) {
    counters.deferredKeys += 1
    logItem(runId, {
      entityType: 'storage_key',
      sourceKey: item.key,
      action: 'deferred',
      reason: item.reason,
      details: { itemCount: item.itemCount },
    })
  }
}

export function importLegacyFile(filePath) {
  runMigrations()
  assertPhase7GSchema()

  const legacyExport = loadLegacyExport(filePath)
  const duplicateRun = findExistingRun(legacyExport.sourceSha256)
  if (duplicateRun) {
    throw new Error(`This exact export was already imported in run ${duplicateRun.id}. The import was stopped to prevent duplicates.`)
  }

  const candidates = collectLegacyCandidates(legacyExport)
  const runId = newId('migration-run')
  const counters = {
    guests: { inserted: 0, matched: 0, skipped: 0 },
    rooms: { inserted: 0, matched: 0, skipped: 0 },
    reservations: { inserted: 0, matched: 0, skipped: 0 },
    charges: { inserted: 0 },
    deferredKeys: 0,
    ignoredKeys: candidates.ignoredKeys.length,
  }

  insertRun({
    id: runId,
    sourceName: legacyExport.sourceName,
    sourceSha256: legacyExport.sourceSha256,
    sourceOrigin: legacyExport.origin,
    exportedAt: legacyExport.exportedAt,
  })

  try {
    const migrate = db.transaction(() => {
      const guestMap = new Map()
      const roomMap = new Map()
      importGuests(runId, candidates.guests, guestMap, counters)
      importRooms(runId, candidates.rooms, roomMap, counters)
      importReservations(runId, candidates.reservations, guestMap, roomMap, counters)
      logDeferredKeys(runId, candidates.deferredKeys, counters)
    })

    migrate()
    const summary = {
      ...counters,
      warnings: candidates.warnings,
      sourceSha256: legacyExport.sourceSha256,
    }
    finishRun(runId, 'completed', summary)
    db.pragma('optimize')
    return { runId, summary }
  } catch (error) {
    finishRun(runId, 'failed', { message: error.message })
    throw error
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: npm run data:migrate:import -- <legacy-export.json>')
    process.exit(1)
  }

  try {
    const result = importLegacyFile(input)
    console.log('Phase 7G data migration completed.')
    console.log(`Migration run: ${result.runId}`)
    console.log(JSON.stringify(result.summary, null, 2))
  } catch (error) {
    console.error(`Phase 7G import failed: ${error.message}`)
    process.exit(1)
  }
}
