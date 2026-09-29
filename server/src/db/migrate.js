import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsDir = path.resolve(__dirname, '../../db/migrations')

function checksum(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function ensureMigrationTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)

  const columns = db.pragma('table_info(schema_migrations)')
  const hasChecksum = columns.some((column) => column.name === 'checksum')

  if (!hasChecksum) {
    db.exec('ALTER TABLE schema_migrations ADD COLUMN checksum TEXT')
  }
}

function listMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migration folder was not found: ${migrationsDir}`)
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d+.*\.sql$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'en'))
}

export function runMigrations() {
  ensureMigrationTable()

  const files = listMigrationFiles()
  const getMigration = db.prepare(
    'SELECT filename, checksum FROM schema_migrations WHERE filename = ?'
  )
  const markMigration = db.prepare(
    'INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)'
  )
  const saveLegacyChecksum = db.prepare(
    'UPDATE schema_migrations SET checksum = ? WHERE filename = ? AND checksum IS NULL'
  )

  const applyMigration = db.transaction((filename, sql, sqlChecksum) => {
    db.exec(sql)
    markMigration.run(filename, sqlChecksum)
  })

  let applied = 0
  let verified = 0

  for (const filename of files) {
    const fullPath = path.join(migrationsDir, filename)
    const sql = fs.readFileSync(fullPath, 'utf8')
    const sqlChecksum = checksum(sql)
    const existing = getMigration.get(filename)

    if (existing) {
      if (existing.checksum && existing.checksum !== sqlChecksum) {
        throw new Error(
          `Applied migration was changed after execution: ${filename}. ` +
          'Restore the original migration instead of editing an applied SQL file.'
        )
      }

      if (!existing.checksum) {
        saveLegacyChecksum.run(sqlChecksum, filename)
      }

      verified += 1
      continue
    }

    applyMigration(filename, sql, sqlChecksum)
    applied += 1
    console.log(`Applied migration: ${filename}`)
  }

  db.pragma('optimize')

  return { applied, verified, total: files.length }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const result = runMigrations()

  if (result.applied === 0) {
    console.log(`Database is already up to date. Verified ${result.verified} migration(s).`)
  } else {
    console.log(`Applied ${result.applied} migration(s). ${result.total} migration file(s) are current.`)
  }
}
