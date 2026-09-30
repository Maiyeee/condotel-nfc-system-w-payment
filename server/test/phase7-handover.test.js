import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'condotel-phase7-handover-'))
process.env.NODE_ENV = 'test'
process.env.DB_PATH = path.join(tempDir, 'phase7.sqlite')
process.env.CORS_ORIGIN = 'http://localhost:5173'

const { runMigrations } = await import('../src/db/migrate.js')
const { db, closeDatabase } = await import('../src/db/database.js')
const { createGuest, editGuest } = await import('../src/services/guestService.js')
const { createRoom, editRoom } = await import('../src/services/roomService.js')
const { createReservation, editReservation } = await import('../src/services/reservationService.js')
const { createCharge, editCharge } = await import('../src/services/chargeService.js')

runMigrations()

test.after(() => {
  closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

test('all Phase 7 migrations 001 through 006 are applied', () => {
  const files = db.prepare('SELECT filename FROM schema_migrations ORDER BY filename').all().map((row) => row.filename)
  assert.deepEqual(files, [
    '001_phase7_foundation.sql',
    '002_sqlite_foundation.sql',
    '003_guests_backend.sql',
    '004_rooms_backend.sql',
    '005_reservations_charges.sql',
    '006_data_migration.sql'
  ])
})

test('SQLite integrity and foreign keys pass', () => {
  assert.equal(db.pragma('integrity_check', { simple: true }), 'ok')
  assert.equal(db.pragma('foreign_key_check').length, 0)
  assert.equal(db.pragma('foreign_keys', { simple: true }), 1)
  assert.equal(String(db.pragma('journal_mode', { simple: true })).toLowerCase(), 'wal')
})

test('guest and room uniqueness rules reject duplicates', () => {
  createGuest({
    id: 'handover-guest-1',
    name: 'Handover Guest',
    email: 'handover@example.com',
    phone: '09170000000',
    idNumber: 'HANDOVER-ID-1',
    address: 'Test Address',
    status: 'active'
  })

  assert.throws(
    () => createGuest({
      id: 'handover-guest-2',
      name: 'Duplicate Guest',
      email: 'HANDOVER@example.com',
      phone: '09170000001',
      idNumber: 'HANDOVER-ID-2',
      address: '',
      status: 'active'
    }),
    (error) => error.code === 'GUEST_EMAIL_EXISTS'
  )

  createRoom({
    id: 'handover-room-1',
    roomNumber: 'H-101',
    name: 'Handover Room',
    type: 'Standard',
    rateCentavos: 250000,
    status: 'Available'
  })

  assert.throws(
    () => createRoom({
      id: 'handover-room-2',
      roomNumber: 'h-101',
      name: 'Duplicate Room',
      type: 'Standard',
      rateCentavos: 250000,
      status: 'Available'
    }),
    (error) => error.code === 'ROOM_NUMBER_EXISTS'
  )
})

test('reservation overlap is rejected and adjacent stay is accepted', () => {
  createGuest({
    id: 'handover-guest-3',
    name: 'Second Guest',
    email: 'second@example.com',
    phone: '09170000002',
    idNumber: 'HANDOVER-ID-3',
    address: '',
    status: 'active'
  })

  const first = createReservation({
    id: 'handover-res-1',
    referenceNo: 'HANDOVER-RES-001',
    guestId: 'handover-guest-1',
    roomId: 'handover-room-1',
    checkIn: '2026-11-10',
    checkOut: '2026-11-12',
    status: 'Confirmed',
    notes: ''
  })

  assert.equal(first.chargeSummary.totalCentavos, 500000)
  assert.equal(first.charges.filter((charge) => charge.source === 'room_rate').length, 1)

  assert.throws(
    () => createReservation({
      id: 'handover-res-2',
      referenceNo: 'HANDOVER-RES-002',
      guestId: 'handover-guest-3',
      roomId: 'handover-room-1',
      checkIn: '2026-11-11',
      checkOut: '2026-11-13',
      status: 'Confirmed',
      notes: ''
    }),
    (error) => error.code === 'RESERVATION_OVERLAP'
  )

  const adjacent = createReservation({
    id: 'handover-res-3',
    referenceNo: 'HANDOVER-RES-003',
    guestId: 'handover-guest-3',
    roomId: 'handover-room-1',
    checkIn: '2026-11-12',
    checkOut: '2026-11-13',
    status: 'Confirmed',
    notes: ''
  })

  assert.equal(adjacent.checkIn, '2026-11-12')
})

test('optimistic versions reject stale guest, room, reservation, and charge updates', () => {
  const guest = editGuest('handover-guest-1', { version: 1, phone: '09990000001' })
  assert.equal(guest.version, 2)
  assert.throws(
    () => editGuest('handover-guest-1', { version: 1, phone: '09990000002' }),
    (error) => error.code === 'STALE_GUEST_VERSION'
  )

  const room = editRoom('handover-room-1', { version: 1, name: 'Updated Handover Room' })
  assert.equal(room.version, 2)
  assert.throws(
    () => editRoom('handover-room-1', { version: 1, name: 'Stale Room Edit' }),
    (error) => error.code === 'STALE_ROOM_VERSION'
  )

  const reservation = editReservation('handover-res-1', { version: 1, notes: 'Updated' })
  assert.equal(reservation.version, 2)
  assert.throws(
    () => editReservation('handover-res-1', { version: 1, notes: 'Stale' }),
    (error) => error.code === 'STALE_RESERVATION_VERSION'
  )

  const created = createCharge('handover-res-1', {
    id: 'handover-charge-1',
    description: 'Extra towel',
    amountCentavos: 5000,
    quantity: 1,
    chargeType: 'Charge'
  })

  const updated = editCharge(created.charge.id, {
    version: 1,
    description: 'Extra towels',
    amountCentavos: 5000,
    quantity: 2,
    chargeType: 'Charge'
  })
  assert.equal(updated.charge.version, 2)

  assert.throws(
    () => editCharge(created.charge.id, {
      version: 1,
      description: 'Stale charge',
      amountCentavos: 5000,
      quantity: 1,
      chargeType: 'Charge'
    }),
    (error) => error.code === 'STALE_CHARGE_VERSION'
  )
})

test('records persist and are readable from a separate SQLite connection', async () => {
  db.pragma('wal_checkpoint(PASSIVE)')
  const { default: Database } = await import('better-sqlite3')
  const second = new Database(process.env.DB_PATH, { readonly: true })

  try {
    assert.equal(second.prepare(`SELECT COUNT(*) AS count FROM guests`).get().count >= 2, true)
    assert.equal(second.prepare(`SELECT COUNT(*) AS count FROM rooms`).get().count >= 1, true)
    assert.equal(second.prepare(`SELECT COUNT(*) AS count FROM reservations`).get().count >= 2, true)
    assert.equal(second.prepare(`SELECT COUNT(*) AS count FROM reservation_charges`).get().count >= 3, true)
  } finally {
    second.close()
  }
})
