import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, closeDatabase } from '../db/database.js'

const __filename = fileURLToPath(import.meta.url)

export async function backupDatabase() {
  const backupDir = path.resolve('data-migration/backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const destination = path.join(backupDir, `condotel-before-7g-${timestamp}.sqlite`)

  db.pragma('wal_checkpoint(FULL)')
  await db.backup(destination)
  return destination
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    const destination = await backupDatabase()
    console.log(`SQLite backup created: ${destination}`)
    closeDatabase()
  } catch (error) {
    console.error(`Backup failed: ${error.message}`)
    process.exit(1)
  }
}
