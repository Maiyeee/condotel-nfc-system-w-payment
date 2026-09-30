import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'condotel-phase7d-rooms-'))

process.env.NODE_ENV = 'test'
process.env.DB_PATH = path.join(tempDir, 'phase7d.sqlite')
process.env.CORS_ORIGIN = 'http://localhost:5173'

const { runMigrations } = await import('../src/db/migrate.js')
const { db, closeDatabase } = await import('../src/db/database.js')
const {
  createRoom,
  editRoom,
  getAvailableRooms,
  getRoom,
  getRooms,
  getRoomsSummary,
  removeRoom
} = await import('../src/services/roomService.js')
const { createGuest } = await import('../src/services/guestService.js')
const { createReservation } = await import('../src/services/reservationService.js')

runMigrations()

test.after(() => {
  closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

test('Phase 7D migration adds room backend indexes', () => {
  const indexes = db.pragma('index_list(rooms)').map((index) => index.name)

  assert.equal(indexes.includes('idx_rooms_room_number_unique_ci'), true)
  assert.equal(indexes.includes('idx_rooms_name_ci'), true)
  assert.equal(indexes.includes('idx_rooms_type_status'), true)
  assert.equal(indexes.includes('idx_rooms_rate_centavos'), true)
})

test('room create returns the Rooms API field shape', () => {
  const room = createRoom({
    id: 'room-7d-201',
    roomNumber: '201',
    name: 'Room 201',
    type: 'Deluxe',
    rateCentavos: 250000,
    status: 'Available'
  })

  assert.equal(room.roomNumber, '201')
  assert.equal(room.name, 'Room 201')
  assert.equal(room.type, 'Deluxe')
  assert.equal(room.rateCentavos, 250000)
  assert.equal(room.status, 'Available')
  assert.equal(room.version, 1)
  assert.equal(Array.isArray(room.reservations), true)
})

test('duplicate room number is rejected case-insensitively', () => {
  assert.throws(
    () => createRoom({
      id: 'room-duplicate-201',
      roomNumber: ' 201 ',
      name: 'Duplicate Room',
      type: 'Standard',
      rateCentavos: 180000,
      status: 'Available'
    }),
    (error) => error.code === 'ROOM_NUMBER_EXISTS'
  )
})

test('room list supports search, status, and type filtering', () => {
  createRoom({
    id: 'room-7d-202',
    roomNumber: '202',
    name: 'Room 202',
    type: 'Suite',
    rateCentavos: 350000,
    status: 'Maintenance'
  })

  const search = getRooms({
    page: 1,
    limit: 20,
    search: '201',
    status: undefined,
    type: ''
  })
  assert.equal(search.total, 1)
  assert.equal(search.data[0].id, 'room-7d-201')

  const maintenanceSuites = getRooms({
    page: 1,
    limit: 20,
    search: '',
    status: 'Maintenance',
    type: 'Suite'
  })
  assert.equal(maintenanceSuites.total, 1)
  assert.equal(maintenanceSuites.data[0].id, 'room-7d-202')
})

test('room update uses optimistic version checks', () => {
  const updated = editRoom('room-7d-201', {
    version: 1,
    rateCentavos: 275000,
    name: 'Deluxe Room 201'
  })

  assert.equal(updated.rateCentavos, 275000)
  assert.equal(updated.name, 'Deluxe Room 201')
  assert.equal(updated.version, 2)

  assert.throws(
    () => editRoom('room-7d-201', {
      version: 1,
      rateCentavos: 300000
    }),
    (error) => error.code === 'STALE_ROOM_VERSION'
  )
})

test('availability excludes overlapping and non-serviceable rooms', () => {
  createGuest({
    id: 'room-test-guest',
    name: 'Room Test Guest',
    email: 'room.test@example.com',
    phone: '09170000077',
    idNumber: 'ROOM-TEST-ID',
    address: '',
    status: 'active'
  })

  createRoom({
    id: 'room-7d-203',
    roomNumber: '203',
    name: 'Room 203',
    type: 'Deluxe',
    rateCentavos: 260000,
    status: 'Available'
  })

  createReservation({
    id: 'room-test-reservation',
    referenceNo: 'ROOM-RES-001',
    guestId: 'room-test-guest',
    roomId: 'room-7d-201',
    checkIn: '2026-10-10',
    checkOut: '2026-10-12',
    status: 'Confirmed',
    notes: ''
  })

  const available = getAvailableRooms({
    checkIn: '2026-10-11',
    checkOut: '2026-10-13',
    type: ''
  })

  assert.equal(available.some((room) => room.id === 'room-7d-201'), false)
  assert.equal(available.some((room) => room.id === 'room-7d-202'), false)
  assert.equal(available.some((room) => room.id === 'room-7d-203'), true)
})

test('room detail returns reservation history and protected delete behavior', () => {
  const room = getRoom('room-7d-201')
  assert.equal(room.reservations.length, 1)
  assert.equal(room.reservations[0].guestName, 'Room Test Guest')

  assert.throws(
    () => removeRoom('room-7d-201'),
    (error) => error.code === 'ROOM_HAS_RESERVATIONS'
  )
})

test('room without reservation history is deletable', () => {
  createRoom({
    id: 'room-delete-me',
    roomNumber: '299',
    name: 'Room 299',
    type: 'Standard',
    rateCentavos: 150000,
    status: 'Out of Service'
  })

  removeRoom('room-delete-me')

  assert.throws(
    () => getRoom('room-delete-me'),
    (error) => error.code === 'ROOM_NOT_FOUND'
  )
})

test('room summary returns status counts and type groups', () => {
  const summary = getRoomsSummary()

  assert.equal(summary.total >= 3, true)
  assert.equal(summary.maintenance >= 1, true)
  assert.equal(summary.byType.some((item) => item.type === 'Deluxe'), true)
})
