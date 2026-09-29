import { Router } from 'express'
import { z } from 'zod'
import {
  createReservation,
  editReservation,
  getReservation,
  getReservations,
  removeReservation
} from '../services/reservationService.js'
import {
  createReservationSchema,
  updateReservationSchema
} from '../validation/reservationSchemas.js'
import { parsePageQuery, validateBody } from '../validation/common.js'
import { HttpError } from '../utils/HttpError.js'

export const reservationRoutes = Router()

function parseReservationQuery(query) {
  const common = parsePageQuery(query)

  const extra = z
    .object({
      guestId: z.string().min(1).max(100).optional(),
      roomId: z.string().min(1).max(100).optional()
    })
    .safeParse(query)

  if (!extra.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'The query parameters are invalid.',
      extra.error.flatten()
    )
  }

  return { ...common, ...extra.data }
}

reservationRoutes.get('/', (req, res) => {
  const query = parseReservationQuery(req.query)
  const result = getReservations(query)

  res.json({
    data: result.data,
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / query.limit))
    }
  })
})

reservationRoutes.get('/:id', (req, res) => {
  res.json({ data: getReservation(req.params.id) })
})

reservationRoutes.post(
  '/',
  validateBody(createReservationSchema),
  (req, res) => {
    res.status(201).json({ data: createReservation(req.validatedBody) })
  }
)

reservationRoutes.patch(
  '/:id',
  validateBody(updateReservationSchema),
  (req, res) => {
    res.json({ data: editReservation(req.params.id, req.validatedBody) })
  }
)

reservationRoutes.delete('/:id', (req, res) => {
  removeReservation(req.params.id)
  res.status(204).end()
})
