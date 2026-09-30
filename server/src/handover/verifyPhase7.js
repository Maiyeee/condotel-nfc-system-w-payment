import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, getDatabaseInfo } from '../db/database.js'
import { env } from '../config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '../..')
const migrationsDir = path.join(serverRoot, 'db', 'migrations')

const REQUIRED_MIGRATIONS = [
  '001_phase7_foundation.sql',
  '002_sqlite_foundation.sql',
  '003_guests_backend.sql',
  '004_rooms_backend.sql',
  '005_reservations_charges.sql',
  '006_data_migration.sql'
]

const REQUIRED_TABLES = [
  'schema_migrations',
  'database_metadata',
  'guests',
  'rooms',
  'reservations',
  'reservation_charges',
  'data_migration_runs',
  'data_migration_items'
]

const REQUIRED_COLUMNS = {
  guests: ['id', 'name', 'email', 'phone', 'id_number', 'address', 'status', 'version', 'created_at', 'updated_at'],
  rooms: ['id', 'room_number', 'name', 'type', 'rate_centavos', 'status', 'version', 'created_at', 'updated_at'],
  reservations: ['id', 'reference_no', 'guest_id', 'room_id', 'check_in', 'check_out', 'status', 'notes', 'version', 'created_at', 'updated_at'],
  reservation_charges: ['id', 'reservation_id', 'description', 'amount_centavos', 'quantity', 'charge_type', 'source', 'version', 'created_at', 'updated_at']
}

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function check(name, ok, details = '') {
  return { name, ok: Boolean(ok), details: String(details || '') }
}

function tableNames() {
  return new Set(
    db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`)
      .all()
      .map((row) => row.name)
  )
}

function columnNames(table) {
  return new Set(db.pragma(`table_info(${table})`).map((row) => row.name))
}

function migrationChecks() {
  const tableExists = tableNames().has('schema_migrations')
  if (!tableExists) {
    return REQUIRED_MIGRATIONS.map((filename) =>
      check(`Migration ${filename}`, false, 'schema_migrations table does not exist')
    )
  }

  const applied = new Map(
    db.prepare('SELECT filename, checksum FROM schema_migrations').all()
      .map((row) => [row.filename, row.checksum])
  )

  return REQUIRED_MIGRATIONS.map((filename) => {
    const fullPath = path.join(migrationsDir, filename)
    if (!fs.existsSync(fullPath)) {
      return check(`Migration ${filename}`, false, 'migration file is missing')
    }

    if (!applied.has(filename)) {
      return check(`Migration ${filename}`, false, 'migration is not recorded as applied')
    }

    const sql = fs.readFileSync(fullPath, 'utf8')
    const expected = sha256(sql)
    const recorded = applied.get(filename)

    if (!recorded) {
      return check(`Migration ${filename}`, false, 'applied migration has no checksum')
    }

    return check(
      `Migration ${filename}`,
      recorded === expected,
      recorded === expected ? 'checksum verified' : 'checksum mismatch, restore the original applied migration file'
    )
  })
}

function schemaChecks() {
  const tables = tableNames()
  const checks = REQUIRED_TABLES.map((name) =>
    check(`Table ${name}`, tables.has(name), tables.has(name) ? 'present' : 'missing')
  )

  for (const [table, required] of Object.entries(REQUIRED_COLUMNS)) {
    if (!tables.has(table)) continue
    const actual = columnNames(table)
    const missing = required.filter((column) => !actual.has(column))
    checks.push(check(`Columns ${table}`, missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : 'complete'))
  }

  return checks
}

function dataChecks() {
  const foreignKeyProblems = db.pragma('foreign_key_check')
  const integrity = db.pragma('integrity_check', { simple: true })

  const duplicateEmails = db.prepare(`
    SELECT COUNT(*) AS count FROM (
      SELECT lower(email)
      FROM guests
      WHERE trim(email) <> ''
      GROUP BY lower(email)
      HAVING COUNT(*) > 1
    )
  `).get().count

  const duplicateIds = db.prepare(`
    SELECT COUNT(*) AS count FROM (
      SELECT upper(id_number)
      FROM guests
      WHERE trim(id_number) <> ''
      GROUP BY upper(id_number)
      HAVING COUNT(*) > 1
    )
  `).get().count

  const duplicateRooms = db.prepare(`
    SELECT COUNT(*) AS count FROM (
      SELECT lower(trim(room_number))
      FROM rooms
      GROUP BY lower(trim(room_number))
      HAVING COUNT(*) > 1
    )
  `).get().count

  const activeOverlaps = db.prepare(`
    SELECT COUNT(*) AS count
    FROM reservations a
    JOIN reservations b
      ON a.id < b.id
     AND a.room_id = b.room_id
     AND a.status IN ('Pending', 'Confirmed', 'Checked-in')
     AND b.status IN ('Pending', 'Confirmed', 'Checked-in')
     AND a.check_in < b.check_out
     AND a.check_out > b.check_in
  `).get().count

  const orphanCharges = db.prepare(`
    SELECT COUNT(*) AS count
    FROM reservation_charges c
    LEFT JOIN reservations r ON r.id = c.reservation_id
    WHERE r.id IS NULL
  `).get().count

  const duplicateRoomRates = db.prepare(`
    SELECT COUNT(*) AS count FROM (
      SELECT reservation_id
      FROM reservation_charges
      WHERE source = 'room_rate'
      GROUP BY reservation_id
      HAVING COUNT(*) > 1
    )
  `).get().count

  return [
    check('SQLite integrity_check', integrity === 'ok', integrity),
    check('Foreign key integrity', foreignKeyProblems.length === 0, `${foreignKeyProblems.length} problem(s)`),
    check('Unique guest emails', duplicateEmails === 0, `${duplicateEmails} duplicate group(s)`),
    check('Unique guest ID numbers', duplicateIds === 0, `${duplicateIds} duplicate group(s)`),
    check('Unique room numbers', duplicateRooms === 0, `${duplicateRooms} duplicate group(s)`),
    check('No active reservation overlaps', activeOverlaps === 0, `${activeOverlaps} overlap(s)`),
    check('No orphan reservation charges', orphanCharges === 0, `${orphanCharges} orphan charge(s)`),
    check('One automatic room-rate line per reservation', duplicateRoomRates === 0, `${duplicateRoomRates} duplicate room-rate group(s)`)
  ]
}

function configurationChecks() {
  const info = getDatabaseInfo()
  return [
    check('Database file exists', fs.existsSync(env.DB_PATH), env.DB_PATH),
    check('Foreign keys enabled', info.foreignKeys === 1, `foreign_keys=${info.foreignKeys}`),
    check('WAL mode enabled', String(info.journalMode).toLowerCase() === 'wal', `journal_mode=${info.journalMode}`),
    check('FULL synchronous mode', info.synchronous === 2, `synchronous=${info.synchronous}`),
    check('Busy timeout configured', info.busyTimeout >= 5000, `busy_timeout=${info.busyTimeout} ms`)
  ]
}

function counts() {
  return {
    guests: db.prepare('SELECT COUNT(*) AS count FROM guests').get().count,
    rooms: db.prepare('SELECT COUNT(*) AS count FROM rooms').get().count,
    reservations: db.prepare('SELECT COUNT(*) AS count FROM reservations').get().count,
    charges: db.prepare('SELECT COUNT(*) AS count FROM reservation_charges').get().count,
    migrationRuns: db.prepare('SELECT COUNT(*) AS count FROM data_migration_runs').get().count,
    migrationItems: db.prepare('SELECT COUNT(*) AS count FROM data_migration_items').get().count
  }
}

export function verifyPhase7() {
  const checks = [
    ...configurationChecks(),
    ...migrationChecks(),
    ...schemaChecks(),
    ...dataChecks()
  ]

  const failures = checks.filter((item) => !item.ok)
  return {
    ok: failures.length === 0,
    checkedAt: new Date().toISOString(),
    databasePath: env.DB_PATH,
    counts: counts(),
    checks,
    failures
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const result = verifyPhase7()
  console.log(`Phase 7 verification: ${result.ok ? 'PASS' : 'FAIL'}`)
  console.log(`Database: ${result.databasePath}`)
  console.log(`Rows: guests=${result.counts.guests}, rooms=${result.counts.rooms}, reservations=${result.counts.reservations}, charges=${result.counts.charges}`)
  console.log('')

  for (const item of result.checks) {
    console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}${item.details ? ` - ${item.details}` : ''}`)
  }

  if (!result.ok) process.exitCode = 1
}
