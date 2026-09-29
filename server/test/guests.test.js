import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'condotel-phase7c-guests-'))

process.env.NODE_ENV = 'test'
process.env.DB_PATH = path.join(tempDir, 'phase7c.sqlite')
process.env.CORS_ORIGIN = 'http://localhost:5173'

const { runMigrations } = await import('../src/db/migrate.js')
const { db, closeDatabase } = await import('../src/db/database.js')
const {
  createGuest,
  editGuest,
  getGuest,
  getGuests,
  removeGuest
} = await import('../src/services/guestService.js')
const { createRoom } = await import('../src/services/roomService.js')
const { createReservation } = await import('../src/services/reservationService.js')

runMigrations()

test.after(() => {
  closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

test('Phase 7C migration adds id_number and guest indexes', () => {
  const columns = db.pragma('table_info(guests)').map((column) => column.name)
  const indexes = db.pragma('index_list(guests)').map((index) => index.name)

  assert.equal(columns.includes('id_number'), true)
  assert.equal(indexes.includes('idx_guests_id_number'), true)
  assert.equal(indexes.includes('idx_guests_email_unique_ci'), true)
  assert.equal(indexes.includes('idx_guests_id_number_unique_ci'), true)
})

test('guest create and detail match the current Guests UI field shape', () => {
  const guest = createGuest({
    id: 'guest-ui-shape',
    name: 'Ana Lopez',
    email: 'ANA.LOPEZ@example.com',
    phone: '09175607901',
    idNumber: 'PSA-0012348',
    address: '',
    status: 'active'
  })

  assert.equal(guest.name, 'Ana Lopez')
  assert.equal(guest.email, 'ana.lopez@example.com')
  assert.equal(guest.idNumber, 'PSA-0012348')
  assert.equal(guest.status, 'active')
  assert.equal(Array.isArray(guest.reservations), true)
  assert.equal(guest.version, 1)
})

test('duplicate email is rejected case-insensitively', () => {
  assert.throws(
    () =>
      createGuest({
        id: 'guest-duplicate-email',
        name: 'Duplicate Email',
        email: 'ANA.LOPEZ@EXAMPLE.COM',
        phone: '09170000001',
        idNumber: 'PSA-DUP-EMAIL',
        address: '',
        status: 'active'
      }),
    (error) => error.code === 'GUEST_EMAIL_EXISTS'
  )
})

test('guest search includes ID number and status filter', () => {
  const byId = getGuests({
    page: 1,
    limit: 20,
    search: '0012348',
    status: undefined
  })

  assert.equal(byId.total, 1)
  assert.equal(byId.data[0].id, 'guest-ui-shape')

  const active = getGuests({
    page: 1,
    limit: 20,
    search: '',
    status: 'active'
  })

  assert.equal(active.data.some((guest) => guest.id === 'guest-ui-shape'), true)
})

test('guest update uses optimistic version checks', () => {
  const updated = editGuest('guest-ui-shape', {
    version: 1,
    phone: '09175607999',
    status: 'inactive'
  })

  assert.equal(updated.phone, '09175607999')
  assert.equal(updated.status, 'inactive')
  assert.equal(updated.version, 2)

  assert.throws(
    () =>
      editGuest('guest-ui-shape', {
        version: 1,
        phone: '09170000000'
      }),
    (error) => error.code === 'STALE_GUEST_VERSION'
  )
})

test('guest detail returns reservation history and protected delete behavior', () => {
  createRoom({
    id: 'guest-test-room',
    roomNumber: 'G-101',
    name: 'Guest Test Room',
    type: 'Standard',
    rateCentavos: 100000,
    status: 'Available'
  })

  createReservation({
    id: 'guest-test-reservation',
    referenceNo: 'GUEST-RES-001',
    guestId: 'guest-ui-shape',
    roomId: 'guest-test-room',
    checkIn: '2026-10-10',
    checkOut: '2026-10-12',
    status: 'Confirmed',
    notes: ''
  })

  const guest = getGuest('guest-ui-shape')
  assert.equal(guest.reservations.length, 1)
  assert.equal(guest.reservations[0].room, 'Guest Test Room')
  assert.equal(guest.reservations[0].status, 'confirmed')

  assert.throws(
    () => removeGuest('guest-ui-shape'),
    (error) => error.code === 'GUEST_HAS_RESERVATIONS'
  )
})

test('guest without reservation history is deletable', () => {
  createGuest({
    id: 'guest-delete-me',
    name: 'Delete Me',
    email: 'delete.me@example.com',
    phone: '09170000002',
    idNumber: 'PSA-DELETE-1',
    address: '',
    status: 'inactive'
  })

  removeGuest('guest-delete-me')

  assert.throws(
    () => getGuest('guest-delete-me'),
    (error) => error.code === 'GUEST_NOT_FOUND'
  )
})
