import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { env } from '../config/env.js'

fs.mkdirSync(path.dirname(env.DB_PATH), { recursive: true })

export const db = new Database(env.DB_PATH)

db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')
db.pragma('synchronous = FULL')
db.pragma('busy_timeout = 5000')

export function closeDatabase() {
  if (db.open) db.close()
}
