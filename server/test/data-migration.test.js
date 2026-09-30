import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'condotel-phase7g-'))
process.env.NODE_ENV = 'test'
process.env.DB_PATH = path.join(tempDir, 'phase7g.sqlite')
process.env.CORS_ORIGIN = 'http://localhost:5173'

const { runMigrations } = await import('../src/db/migrate.js')
const { db, closeDatabase } = await import('../src/db/database.js')
const { importLegacyFile } = await import('../src/dataMigration/importLegacyData.js')
const { verifyDataMigration } = await import('../src/dataMigration/verifyDataMigration.js')

runMigrations()

test.after(() => {
  closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

const exportFile = path.join(tempDir, 'legacy-export.json')
fs.writeFileSync(exportFile, JSON.stringify({
  format: 'condotel-localstorage-export-v1',
  exportedAt: '2026-09-30T00:00:00.000Z',
  origin: 'http://localhost:5173',
  entries: [
    {
      key: 'condotel.guests.legacy',
      parsed: [
        { id: 'old-g-1', name: 'Legacy Guest', email: 'legacy@example.com', phone: '09170000001', idNumber: 'LEGACY-ID-1', status: 'Active' }
      ]
    },
    {
      key: 'condotel.rooms.phase2',
      parsed: [
        { id: 'old-r-1', roomNumber: '901', name: 'Legacy Room 901', type: 'Deluxe', rate: 2500, status: 'Available' }
      ]
    },
    {
      key: 'condotel.reservations.phase2',
      parsed: [
        { id: 'old-res-1', referenceNo: 'LEGACY-RES-1', guestId: 'old-g-1', roomId: 'old-r-1', checkIn: '2026-11-01', checkOut: '2026-11-03', status: 'Confirmed' }
      ]
    },
    {
      key: 'condotel.payments.phase4',
      parsed: [
        { id: 'pay-demo-1', amount: 5000, status: 'Paid' }
      ]
    }
  ]
}, null, 2))

test('Phase 7G migration tables exist', () => {
  const runTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='data_migration_runs'").get()
  const itemTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='data_migration_items'").get()
  assert.equal(runTable.name, 'data_migration_runs')
  assert.equal(itemTable.name, 'data_migration_items')
})

test('legacy guests, rooms, and reservations import with relationship mapping', () => {
  const result = importLegacyFile(exportFile)
  assert.equal(result.summary.guests.inserted, 1)
  assert.equal(result.summary.rooms.inserted, 1)
  assert.equal(result.summary.reservations.inserted, 1)
  assert.equal(result.summary.charges.inserted, 1)
  assert.equal(result.summary.deferredKeys, 1)

  const guest = db.prepare("SELECT * FROM guests WHERE lower(email) = 'legacy@example.com'").get()
  const room = db.prepare("SELECT * FROM rooms WHERE room_number = '901'").get()
  const reservation = db.prepare("SELECT * FROM reservations WHERE reference_no = 'LEGACY-RES-1'").get()
  const charge = db.prepare("SELECT * FROM reservation_charges WHERE reservation_id = ? AND source = 'room_rate'").get(reservation.id)

  assert.equal(reservation.guest_id, guest.id)
  assert.equal(reservation.room_id, room.id)
  assert.equal(charge.amount_centavos, 250000)
  assert.equal(charge.quantity, 2)
})

test('the same export cannot be committed twice', () => {
  assert.throws(
    () => importLegacyFile(exportFile),
    /already imported/i
  )
})

test('verification passes after import', () => {
  const result = verifyDataMigration()
  assert.equal(result.pass, true)
  assert.equal(result.foreignKeyIssues.length, 0)
  assert.equal(result.counts.migrationRuns, 1)
})
