import { Router } from 'express'
import {
  createGuest,
  editGuest,
  getGuest,
  getGuests,
  removeGuest
} from '../services/guestService.js'
import {
  createGuestSchema,
  guestListQuerySchema,
  updateGuestSchema
} from '../validation/guestSchemas.js'
import { validateBody } from '../validation/common.js'
import { HttpError } from '../utils/HttpError.js'

export const guestRoutes = Router()

function parseGuestQuery(query) {
  const result = guestListQuerySchema.safeParse(query)

  if (!result.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'The guest query parameters are invalid.',
      result.error.flatten()
    )
  }

  return result.data
}

guestRoutes.get('/', (req, res) => {
  const query = parseGuestQuery(req.query)
  const result = getGuests(query)

  res.json({
    data: result.data,
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit)
    }
  })
})

guestRoutes.get('/:id', (req, res) => {
  res.json({ data: getGuest(req.params.id) })
})

guestRoutes.post('/', validateBody(createGuestSchema), (req, res) => {
  res.status(201).json({ data: createGuest(req.validatedBody) })
})

guestRoutes.patch('/:id', validateBody(updateGuestSchema), (req, res) => {
  res.json({ data: editGuest(req.params.id, req.validatedBody) })
})

// PUT is kept as an alias because the current Guests mock-data comments
// describe GET/POST/PUT/DELETE as the planned backend contract.
guestRoutes.put('/:id', validateBody(updateGuestSchema), (req, res) => {
  res.json({ data: editGuest(req.params.id, req.validatedBody) })
})

guestRoutes.delete('/:id', (req, res) => {
  removeGuest(req.params.id)
  res.status(204).end()
})
