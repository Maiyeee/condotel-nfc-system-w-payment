import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { env } from '../config/env.js'
import {
  assertDatabaseReady,
  closeDatabase,
  db,
  getDatabaseInfo
} from './database.js'
import { runMigrations } from './migrate.js'

const __filename = fileURLToPath(import.meta.url)

const requiredTables = [
  'schema_migrations',
  'database_metadata',
  'guests',
  'rooms',
  'reservations',
  'reservation_charges'
]

const requiredIndexes = [
  'idx_guests_name',
  'idx_guests_email',
  'idx_guests_phone',
  'idx_rooms_status',
  'idx_rooms_type',
  'idx_reservations_guest_id',
  'idx_reservations_room_dates',
  'idx_reservations_active_room_dates',
  'idx_reservation_charges_reservation_id',
  'idx_reservation_charges_reservation_created'
]

function getObjectNames(type) {
  return new Set(
    db.prepare(
      `SELECT name FROM sqlite_master WHERE type = ? AND name NOT LIKE 'sqlite_%'`
    ).all(type).map((row) => row.name)
  )
}

function missingValues(required, actual) {
  return required.filter((name) => !actual.has(name))
}

export function verifySQLiteFoundation() {
  runMigrations()
  const info = assertDatabaseReady()

  const tables = getObjectNames('table')
  const indexes = getObjectNames('index')
  const missingTables = missingValues(requiredTables, tables)
  const missingIndexes = missingValues(requiredIndexes, indexes)
  const foreignKeyProblems = db.pragma('foreign_key_check')
  const integrity = db.pragma('integrity_check', { simple: true })

  const failures = []

  if (missingTables.length) failures.push(`Missing table(s): ${missingTables.join(', ')}`)
  if (missingIndexes.length) failures.push(`Missing index(es): ${missingIndexes.join(', ')}`)
  if (foreignKeyProblems.length) failures.push(`Foreign key check reported ${foreignKeyProblems.length} problem(s).`)
  if (integrity !== 'ok') failures.push(`SQLite integrity_check returned: ${integrity}`)
  if (String(info.journalMode).toLowerCase() !== 'wal') failures.push(`journal_mode is ${info.journalMode}, expected WAL.`)
  if (info.foreignKeys !== 1) failures.push('foreign_keys is disabled.')
  if (info.synchronous !== 2) failures.push(`synchronous is ${info.synchronous}, expected FULL (2).`)
  if (info.busyTimeout < 5000) failures.push(`busy_timeout is ${info.busyTimeout}, expected at least 5000 ms.`)

  const migrationRows = db.prepare(`
    SELECT filename, applied_at, checksum
    FROM schema_migrations
    ORDER BY filename
  `).all()

  const counts = {
    guests: db.prepare('SELECT COUNT(*) AS count FROM guests').get().count,
    rooms: db.prepare('SELECT COUNT(*) AS count FROM rooms').get().count,
    reservations: db.prepare('SELECT COUNT(*) AS count FROM reservations').get().count,
    charges: db.prepare('SELECT COUNT(*) AS count FROM reservation_charges').get().count
  }

  const result = {
    ok: failures.length === 0,
    databasePath: env.DB_PATH,
    databaseExists: fs.existsSync(env.DB_PATH),
    databaseBytes: fs.existsSync(env.DB_PATH) ? fs.statSync(env.DB_PATH).size : 0,
    settings: getDatabaseInfo(),
    migrations: migrationRows,
    counts,
    failures
  }

  if (failures.length) {
    const error = new Error(`SQLite Foundation verification failed:\n- ${failures.join('\n- ')}`)
    error.result = result
    throw error
  }

  // Reopen the database read-only to prove the migrated file remains readable
  // after the main connection is closed.
  closeDatabase()
  const reopened = new Database(env.DB_PATH, { readonly: true, fileMustExist: true })
  const reopenedProbe = reopened.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get()
  reopened.close()

  result.reopenCheck = reopenedProbe.count >= 1
  return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    const result = verifySQLiteFoundation()
    console.log('SQLite Foundation: PASS')
    console.log(`Database: ${result.databasePath}`)
    console.log(`Journal mode: ${result.settings.journalMode}`)
    console.log(`Foreign keys: ${result.settings.foreignKeys === 1 ? 'ON' : 'OFF'}`)
    console.log(`Synchronous: ${result.settings.synchronous}`)
    console.log(`Busy timeout: ${result.settings.busyTimeout} ms`)
    console.log(`Migrations: ${result.migrations.map((item) => item.filename).join(', ')}`)
    console.log(`Rows: guests=${result.counts.guests}, rooms=${result.counts.rooms}, reservations=${result.counts.reservations}, charges=${result.counts.charges}`)
    console.log(`Reopen persistence check: ${result.reopenCheck ? 'PASS' : 'FAIL'}`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
