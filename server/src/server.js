import { app } from './app.js'
import { env } from './config/env.js'
import { runMigrations } from './db/migrate.js'
import { closeDatabase } from './db/database.js'

runMigrations()

const server = app.listen(env.PORT, () => {
  console.log(`Condotel Phase 7 API listening on http://localhost:${env.PORT}/api`)
})

function shutdown(signal) {
  console.log(`${signal} received. Closing server.`)

  server.close(() => {
    closeDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
