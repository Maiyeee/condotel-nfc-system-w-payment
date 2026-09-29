import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { env } from '../config/env.js'

fs.mkdirSync(path.dirname(env.DB_PATH), { recursive: true })

export const db = new Database(env.DB_PATH, {
  timeout: 5000
})

// SQLite Foundation settings.
// Foreign keys protect relationships.
// WAL improves read concurrency for the single-host deployment model.
// FULL synchronization prioritizes durability for reservation data.
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')
db.pragma('synchronous = FULL')
db.pragma('busy_timeout = 5000')
db.pragma('wal_autocheckpoint = 1000')

export function getDatabaseInfo() {
  return {
    path: env.DB_PATH,
    foreignKeys: db.pragma('foreign_keys', { simple: true }),
    journalMode: db.pragma('journal_mode', { simple: true }),
    synchronous: db.pragma('synchronous', { simple: true }),
    busyTimeout: db.pragma('busy_timeout', { simple: true }),
    walAutoCheckpoint: db.pragma('wal_autocheckpoint', { simple: true }),
    pageCount: db.pragma('page_count', { simple: true }),
    freelistCount: db.pragma('freelist_count', { simple: true })
  }
}

export function assertDatabaseReady() {
  const probe = db.prepare('SELECT 1 AS ok').get()
  const info = getDatabaseInfo()

  if (probe?.ok !== 1) {
    throw new Error('SQLite did not respond to the readiness query.')
  }

  if (info.foreignKeys !== 1) {
    throw new Error('SQLite foreign key enforcement is disabled.')
  }

  if (String(info.journalMode).toLowerCase() !== 'wal') {
    throw new Error(`SQLite journal_mode must be WAL. Current value: ${info.journalMode}`)
  }

  return info
}

export function checkpointDatabase(mode = 'PASSIVE') {
  const allowedModes = new Set(['PASSIVE', 'FULL', 'RESTART', 'TRUNCATE'])
  const selected = String(mode).toUpperCase()

  if (!allowedModes.has(selected)) {
    throw new Error(`Unsupported WAL checkpoint mode: ${mode}`)
  }

  return db.pragma(`wal_checkpoint(${selected})`)
}

export function closeDatabase() {
  if (db.open) db.close()
}
