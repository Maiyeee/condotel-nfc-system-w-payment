import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { requestId } from './middleware/requestId.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { healthRoutes } from './routes/healthRoutes.js'
import { guestRoutes } from './routes/guestRoutes.js'
import { roomRoutes } from './routes/roomRoutes.js'
import { reservationRoutes } from './routes/reservationRoutes.js'
import {
  chargeRoutes,
  reservationChargeRoutes
} from './routes/chargeRoutes.js'

export const app = express()

app.disable('x-powered-by')

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
)

app.use(requestId)
app.use(express.json({ limit: '1mb' }))

app.use('/api/health', healthRoutes)
app.use('/api/guests', guestRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/reservations/:reservationId/charges', reservationChargeRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/charges', chargeRoutes)

app.use(notFound)
app.use(errorHandler)
