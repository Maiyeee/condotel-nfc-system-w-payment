import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsDir = path.resolve(__dirname, '../../db/migrations')

function ensureMigrationTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)
}

export function runMigrations() {
  ensureMigrationTable()

  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d+.*\.sql$/i.test(name))
    .sort()

  const hasMigration = db.prepare(
    'SELECT 1 FROM schema_migrations WHERE filename = ?'
  )
  const markMigration = db.prepare(
    'INSERT INTO schema_migrations (filename) VALUES (?)'
  )

  const apply = db.transaction((filename, sql) => {
    db.exec(sql)
    markMigration.run(filename)
  })

  let applied = 0

  for (const filename of files) {
    if (hasMigration.get(filename)) continue
    const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8')
    apply(filename, sql)
    applied += 1
    console.log(`Applied migration: ${filename}`)
  }

  return applied
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const count = runMigrations()
  console.log(count === 0 ? 'Database is already up to date.' : `Applied ${count} migration(s).`)
}
