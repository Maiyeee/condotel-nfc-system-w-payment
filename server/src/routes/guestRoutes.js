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
  updateGuestSchema
} from '../validation/guestSchemas.js'
import { parsePageQuery, validateBody } from '../validation/common.js'

export const guestRoutes = Router()

guestRoutes.get('/', (req, res) => {
  const query = parsePageQuery(req.query)
  const result = getGuests(query)

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

guestRoutes.get('/:id', (req, res) => {
  res.json({ data: getGuest(req.params.id) })
})

guestRoutes.post('/', validateBody(createGuestSchema), (req, res) => {
  res.status(201).json({ data: createGuest(req.validatedBody) })
})

guestRoutes.patch('/:id', validateBody(updateGuestSchema), (req, res) => {
  res.json({ data: editGuest(req.params.id, req.validatedBody) })
})

guestRoutes.delete('/:id', (req, res) => {
  removeGuest(req.params.id)
  res.status(204).end()
})
