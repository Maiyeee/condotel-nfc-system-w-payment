import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'condotel-phase7e-'))

process.env.NODE_ENV = 'test'
process.env.DB_PATH = path.join(tempDir, 'phase7e.sqlite')
process.env.CORS_ORIGIN = 'http://localhost:5173'

const { runMigrations } = await import('../src/db/migrate.js')
const { db, closeDatabase } = await import('../src/db/database.js')
const { createGuest } = await import('../src/services/guestService.js')
const { createRoom } = await import('../src/services/roomService.js')
const {
  createReservation,
  editReservation,
  getReservation,
  getReservations,
  getReservationsSummary
} = await import('../src/services/reservationService.js')
const {
  createCharge,
  editCharge,
  getChargesForReservation,
  removeCharge
} = await import('../src/services/chargeService.js')

runMigrations()

test.after(() => {
  closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

function seedBase() {
  createGuest({
    id: 'phase7e-guest-1',
    name: 'Reservation Guest',
    email: 'reservation.guest@example.com',
    phone: '09170000011',
    idNumber: 'P7E-GUEST-1',
    address: '',
    status: 'active'
  })

  createGuest({
    id: 'phase7e-guest-2',
    name: 'Second Guest',
    email: 'second.guest@example.com',
    phone: '09170000012',
    idNumber: 'P7E-GUEST-2',
    address: '',
    status: 'active'
  })

  createRoom({
    id: 'phase7e-room-1',
    roomNumber: '701',
    name: 'Deluxe 701',
    type: 'Deluxe',
    rateCentavos: 250000,
    status: 'Available'
  })

  createRoom({
    id: 'phase7e-room-2',
    roomNumber: '702',
    name: 'Suite 702',
    type: 'Suite',
    rateCentavos: 400000,
    status: 'Available'
  })
}

seedBase()

test('Phase 7E migration adds charge metadata and indexes', () => {
  const columns = db.pragma('table_info(reservation_charges)').map((column) => column.name)
  const indexes = db.pragma('index_list(reservation_charges)').map((index) => index.name)

  for (const column of ['charge_type', 'source', 'version', 'updated_at']) {
    assert.equal(columns.includes(column), true)
  }

  assert.equal(indexes.includes('idx_reservation_charges_one_room_rate'), true)
  assert.equal(indexes.includes('idx_reservation_charges_type'), true)
})

test('reservation creation snapshots room rate into one room charge', () => {
  const reservation = createReservation({
    id: 'phase7e-res-1',
    referenceNo: 'P7E-RES-001',
    guestId: 'phase7e-guest-1',
    roomId: 'phase7e-room-1',
    checkIn: '2026-10-10',
    checkOut: '2026-10-13',
    status: 'Confirmed',
    notes: 'Three-night stay'
  })

  assert.equal(reservation.charges.length, 1)
  assert.equal(reservation.charges[0].source, 'room_rate')
  assert.equal(reservation.charges[0].chargeType, 'Room')
  assert.equal(reservation.charges[0].amountCentavos, 250000)
  assert.equal(reservation.charges[0].quantity, 3)
  assert.equal(reservation.chargeSummary.totalCentavos, 750000)
})

test('overlapping active reservation is rejected and adjacent stay succeeds', () => {
  assert.throws(
    () => createReservation({
      id: 'phase7e-overlap',
      referenceNo: 'P7E-OVERLAP',
      guestId: 'phase7e-guest-2',
      roomId: 'phase7e-room-1',
      checkIn: '2026-10-12',
      checkOut: '2026-10-14',
      status: 'Confirmed',
      notes: ''
    }),
    (error) => error.code === 'RESERVATION_OVERLAP'
  )

  const adjacent = createReservation({
    id: 'phase7e-adjacent',
    referenceNo: 'P7E-ADJACENT',
    guestId: 'phase7e-guest-2',
    roomId: 'phase7e-room-1',
    checkIn: '2026-10-13',
    checkOut: '2026-10-15',
    status: 'Confirmed',
    notes: ''
  })

  assert.equal(adjacent.chargeSummary.totalCentavos, 500000)
})

test('reservation date or room edit refreshes the room-rate snapshot', () => {
  const updated = editReservation('phase7e-res-1', {
    version: 1,
    roomId: 'phase7e-room-2',
    checkOut: '2026-10-12'
  })

  const roomCharge = updated.charges.find((charge) => charge.source === 'room_rate')

  assert.equal(updated.roomId, 'phase7e-room-2')
  assert.equal(roomCharge.amountCentavos, 400000)
  assert.equal(roomCharge.quantity, 2)
  assert.equal(updated.chargeSummary.totalCentavos, 800000)
  assert.equal(roomCharge.version, 2)
})

test('manual charges, discounts, and adjustments produce signed totals', () => {
  const minibar = createCharge('phase7e-res-1', {
    description: 'Minibar',
    amountCentavos: 15000,
    quantity: 2,
    chargeType: 'Charge'
  })

  assert.equal(minibar.charge.lineTotalCentavos, 30000)

  const discount = createCharge('phase7e-res-1', {
    description: 'Promotional discount',
    amountCentavos: 50000,
    quantity: 1,
    chargeType: 'Discount'
  })

  assert.equal(discount.charge.lineTotalCentavos, -50000)

  const adjustment = createCharge('phase7e-res-1', {
    description: 'Late checkout adjustment',
    amountCentavos: 20000,
    quantity: 1,
    chargeType: 'Adjustment'
  })

  assert.equal(adjustment.summary.positiveChargesCentavos, 850000)
  assert.equal(adjustment.summary.discountsCentavos, 50000)
  assert.equal(adjustment.summary.totalCentavos, 800000)
})

test('manual charge uses optimistic version checks and can be removed', () => {
  const { charges } = getChargesForReservation('phase7e-res-1')
  const manual = charges.find((charge) => charge.description === 'Minibar')

  const updated = editCharge(manual.id, {
    version: manual.version,
    quantity: 3
  })

  assert.equal(updated.charge.quantity, 3)
  assert.equal(updated.charge.version, manual.version + 1)

  assert.throws(
    () => editCharge(manual.id, { version: manual.version, quantity: 4 }),
    (error) => error.code === 'STALE_CHARGE_VERSION'
  )

  const summary = removeCharge(manual.id)
  assert.equal(summary.lineCount, 3)
})

test('system room-rate charge is protected from direct edits and deletes', () => {
  const reservation = getReservation('phase7e-res-1')
  const roomCharge = reservation.charges.find((charge) => charge.source === 'room_rate')

  assert.throws(
    () => editCharge(roomCharge.id, { version: roomCharge.version, quantity: 9 }),
    (error) => error.code === 'ROOM_RATE_CHARGE_PROTECTED'
  )

  assert.throws(
    () => removeCharge(roomCharge.id),
    (error) => error.code === 'ROOM_RATE_CHARGE_PROTECTED'
  )
})

test('reservation list supports date window filters and summary counts', () => {
  const result = getReservations({
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
    guestId: undefined,
    roomId: undefined,
    from: '2026-10-11',
    to: '2026-10-13'
  })

  assert.equal(result.total >= 1, true)
  assert.equal(result.data.some((item) => item.id === 'phase7e-res-1'), true)

  const summary = getReservationsSummary()
  assert.equal(summary.total >= 2, true)
  assert.equal(summary.active >= 2, true)
})
