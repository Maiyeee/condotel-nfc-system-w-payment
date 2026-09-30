import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from '../db/database.js'
import { runMigrations } from '../db/migrate.js'

const __filename = fileURLToPath(import.meta.url)

export function verifyDataMigration() {
  runMigrations()

  const integrity = db.pragma('integrity_check', { simple: true })
  const foreignKeyIssues = db.pragma('foreign_key_check')
  const tables = ['data_migration_runs', 'data_migration_items']
  const missingTables = tables.filter((name) => !db.prepare(
    "SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?"
  ).get(name))

  const latestRun = db.prepare(`
    SELECT id, source_name, source_sha256, status, started_at, completed_at, summary_json
    FROM data_migration_runs
    ORDER BY started_at DESC
    LIMIT 1
  `).get()

  const counts = {
    guests: db.prepare('SELECT COUNT(*) AS count FROM guests').get().count,
    rooms: db.prepare('SELECT COUNT(*) AS count FROM rooms').get().count,
    reservations: db.prepare('SELECT COUNT(*) AS count FROM reservations').get().count,
    charges: db.prepare('SELECT COUNT(*) AS count FROM reservation_charges').get().count,
    migrationRuns: db.prepare('SELECT COUNT(*) AS count FROM data_migration_runs').get().count,
    migrationItems: db.prepare('SELECT COUNT(*) AS count FROM data_migration_items').get().count,
  }

  const pass = integrity === 'ok' && foreignKeyIssues.length === 0 && missingTables.length === 0
  return { pass, integrity, foreignKeyIssues, missingTables, latestRun, counts }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const result = verifyDataMigration()
  console.log(`Phase 7G Data Migration: ${result.pass ? 'PASS' : 'FAIL'}`)
  console.log(`Integrity: ${result.integrity}`)
  console.log(`Foreign-key issues: ${result.foreignKeyIssues.length}`)
  console.log(`Rows: guests=${result.counts.guests}, rooms=${result.counts.rooms}, reservations=${result.counts.reservations}, charges=${result.counts.charges}`)
  console.log(`Migration runs=${result.counts.migrationRuns}, migration items=${result.counts.migrationItems}`)
  if (result.latestRun) console.log(`Latest run: ${result.latestRun.id} (${result.latestRun.status}) from ${result.latestRun.source_name}`)
  if (!result.pass) process.exit(1)
}
