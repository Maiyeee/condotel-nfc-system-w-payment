import { Router } from 'express'
import { db } from '../db/database.js'

export const healthRoutes = Router()

healthRoutes.get('/', (_req, res) => {
  const database = db.prepare('SELECT 1 AS ok').get()

  res.json({
    data: {
      status: 'ok',
      database: database.ok === 1 ? 'ok' : 'error',
      timestamp: new Date().toISOString()
    }
  })
})
