import { Router } from 'express'
import {
  createRoom,
  editRoom,
  getAvailableRooms,
  getRoom,
  getRooms,
  getRoomsSummary,
  removeRoom
} from '../services/roomService.js'
import {
  createRoomSchema,
  roomAvailabilityQuerySchema,
  roomListQuerySchema,
  updateRoomSchema
} from '../validation/roomSchemas.js'
import { validateBody } from '../validation/common.js'
import { HttpError } from '../utils/HttpError.js'

export const roomRoutes = Router()

function parseQuery(schema, query, message) {
  const result = schema.safeParse(query)

  if (!result.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      message,
      result.error.flatten()
    )
  }

  return result.data
}

roomRoutes.get('/summary', (_req, res) => {
  res.json({ data: getRoomsSummary() })
})

roomRoutes.get('/availability', (req, res) => {
  const query = parseQuery(
    roomAvailabilityQuerySchema,
    req.query,
    'The room availability query parameters are invalid.'
  )

  res.json({
    data: getAvailableRooms(query),
    meta: {
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      type: query.type || null
    }
  })
})

roomRoutes.get('/', (req, res) => {
  const query = parseQuery(
    roomListQuerySchema,
    req.query,
    'The room query parameters are invalid.'
  )
  const result = getRooms(query)

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

roomRoutes.get('/:id', (req, res) => {
  res.json({ data: getRoom(req.params.id) })
})

roomRoutes.post('/', validateBody(createRoomSchema), (req, res) => {
  res.status(201).json({ data: createRoom(req.validatedBody) })
})

roomRoutes.patch('/:id', validateBody(updateRoomSchema), (req, res) => {
  res.json({ data: editRoom(req.params.id, req.validatedBody) })
})

roomRoutes.put('/:id', validateBody(updateRoomSchema), (req, res) => {
  res.json({ data: editRoom(req.params.id, req.validatedBody) })
})

roomRoutes.delete('/:id', (req, res) => {
  removeRoom(req.params.id)
  res.status(204).end()
})
