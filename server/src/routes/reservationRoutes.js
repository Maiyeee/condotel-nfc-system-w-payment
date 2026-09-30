import { Router } from 'express'
import { z } from 'zod'
import {
  createReservation,
  editReservation,
  getReservation,
  getReservations,
  getReservationsSummary,
  removeReservation
} from '../services/reservationService.js'
import {
  createReservationSchema,
  reservationStatusSchema,
  updateReservationSchema
} from '../validation/reservationSchemas.js'
import { dateSchema, parsePageQuery, validateBody } from '../validation/common.js'
import { HttpError } from '../utils/HttpError.js'

export const reservationRoutes = Router()

function parseReservationQuery(query) {
  const common = parsePageQuery(query)

  const extra = z
    .object({
      status: reservationStatusSchema.optional(),
      guestId: z.string().min(1).max(100).optional(),
      roomId: z.string().min(1).max(100).optional(),
      from: dateSchema.optional(),
      to: dateSchema.optional()
    })
    .refine((value) => !value.from || !value.to || value.to > value.from, {
      message: 'to must be later than from.',
      path: ['to']
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

  return {
    ...common,
    ...extra.data,
    status: extra.data.status
  }
}

reservationRoutes.get('/summary', (_req, res) => {
  res.json({ data: getReservationsSummary() })
})

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

function updateHandler(req, res) {
  res.json({ data: editReservation(req.params.id, req.validatedBody) })
}

reservationRoutes.patch(
  '/:id',
  validateBody(updateReservationSchema),
  updateHandler
)

reservationRoutes.put(
  '/:id',
  validateBody(updateReservationSchema),
  updateHandler
)

reservationRoutes.delete('/:id', (req, res) => {
  removeReservation(req.params.id)
  res.status(204).end()
})
