import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'condotel-phase7-'))

process.env.NODE_ENV = 'test'
process.env.DB_PATH = path.join(tempDir, 'phase7.sqlite')
process.env.CORS_ORIGIN = 'http://localhost:5173'

const { runMigrations } = await import('../src/db/migrate.js')
const { db, closeDatabase } = await import('../src/db/database.js')
const { createGuest } = await import('../src/services/guestService.js')
const { createRoom } = await import('../src/services/roomService.js')
const {
  createReservation,
  editReservation,
  getReservation
} = await import('../src/services/reservationService.js')

runMigrations()

test.after(() => {
  closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

test('Phase 7 migration creates the core tables', () => {
  const names = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
    .all()
    .map((row) => row.name)

  for (const table of [
    'guests',
    'rooms',
    'reservations',
    'reservation_charges',
    'schema_migrations'
  ]) {
    assert.equal(names.includes(table), true)
  }
})

test('foreign keys reject missing guest and room references', () => {
  assert.throws(
    () =>
      db.prepare(`
        INSERT INTO reservations
          (
            id, reference_no, guest_id, room_id,
            check_in, check_out, status
          )
        VALUES
          (
            'invalid-res', 'INVALID-001', 'missing-guest', 'missing-room',
            '2026-10-01', '2026-10-02', 'Pending'
          )
      `).run(),
    /FOREIGN KEY/
  )
})

test('overlap is rejected, adjacent stay succeeds, stale edit fails', () => {
  createGuest({
    id: 'test-guest-1',
    name: 'Test Guest One',
    email: '',
    phone: '',
    address: '',
    status: 'Active'
  })

  createGuest({
    id: 'test-guest-2',
    name: 'Test Guest Two',
    email: '',
    phone: '',
    address: '',
    status: 'Active'
  })

  createRoom({
    id: 'test-room-1',
    roomNumber: 'T-101',
    name: 'Test Room 101',
    type: 'Standard',
    rateCentavos: 100000,
    status: 'Available'
  })

  const first = createReservation({
    id: 'test-res-1',
    referenceNo: 'TEST-RES-001',
    guestId: 'test-guest-1',
    roomId: 'test-room-1',
    checkIn: '2026-10-10',
    checkOut: '2026-10-12',
    status: 'Confirmed',
    notes: ''
  })

  assert.equal(first.version, 1)

  assert.throws(
    () =>
      createReservation({
        id: 'test-res-2',
        referenceNo: 'TEST-RES-002',
        guestId: 'test-guest-2',
        roomId: 'test-room-1',
        checkIn: '2026-10-11',
        checkOut: '2026-10-13',
        status: 'Confirmed',
        notes: ''
      }),
    (error) => error.code === 'RESERVATION_OVERLAP'
  )

  const adjacent = createReservation({
    id: 'test-res-3',
    referenceNo: 'TEST-RES-003',
    guestId: 'test-guest-2',
    roomId: 'test-room-1',
    checkIn: '2026-10-12',
    checkOut: '2026-10-14',
    status: 'Confirmed',
    notes: ''
  })

  assert.equal(adjacent.checkIn, '2026-10-12')

  const updated = editReservation('test-res-1', {
    version: 1,
    notes: 'Updated from browser A'
  })

  assert.equal(updated.version, 2)

  assert.throws(
    () =>
      editReservation('test-res-1', {
        version: 1,
        notes: 'Stale browser B edit'
      }),
    (error) => error.code === 'STALE_RESERVATION_VERSION'
  )

  assert.equal(getReservation('test-res-1').notes, 'Updated from browser A')
})

test('records are visible from a separate SQLite connection', async () => {
  db.pragma('wal_checkpoint(PASSIVE)')

  const { default: Database } = await import('better-sqlite3')
  const secondConnection = new Database(process.env.DB_PATH, { readonly: true })

  try {
    const count = secondConnection
      .prepare('SELECT COUNT(*) AS count FROM reservations')
      .get().count

    assert.equal(count >= 2, true)
  } finally {
    secondConnection.close()
  }
})
