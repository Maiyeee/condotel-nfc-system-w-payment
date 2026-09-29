import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '../config/env.js'
import { db } from './database.js'
import { runMigrations } from './migrate.js'

const __filename = fileURLToPath(import.meta.url)

const guests = [
  ['guest-001', 'Maria Santos', 'maria.santos@example.com', '09171234567', 'Calbayog City', 'Active'],
  ['guest-002', 'Juan Dela Cruz', 'juan.delacruz@example.com', '09181234567', 'Catbalogan City', 'Active']
]

const rooms = [
  ['room-101', '101', 'Room 101', 'Standard', 180000, 'Available'],
  ['room-102', '102', 'Room 102', 'Standard', 180000, 'Available'],
  ['room-103', '103', 'Room 103', 'Deluxe', 250000, 'Available'],
  ['room-104', '104', 'Room 104', 'Deluxe', 250000, 'Available'],
  ['room-105', '105', 'Room 105', 'Suite', 350000, 'Available'],
  ['room-106', '106', 'Room 106', 'Suite', 350000, 'Maintenance']
]

export function seedDevelopmentData() {
  if (env.NODE_ENV === 'production') {
    throw new Error('Development seed data is disabled when NODE_ENV=production.')
  }

  runMigrations()

  const insertGuest = db.prepare(`
    INSERT INTO guests
      (id, name, email, phone, address, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `)

  const insertRoom = db.prepare(`
    INSERT INTO rooms
      (id, room_number, name, type, rate_centavos, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `)

  const seed = db.transaction(() => {
    for (const guest of guests) insertGuest.run(...guest)
    for (const room of rooms) insertRoom.run(...room)
  })

  seed()

  return {
    guests: db.prepare('SELECT COUNT(*) AS count FROM guests').get().count,
    rooms: db.prepare('SELECT COUNT(*) AS count FROM rooms').get().count
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const totals = seedDevelopmentData()
  console.log(`Development seed data is ready. Guests: ${totals.guests}. Rooms: ${totals.rooms}.`)
}
