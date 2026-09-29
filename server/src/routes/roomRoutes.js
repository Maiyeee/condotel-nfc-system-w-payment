import { Router } from 'express'
import {
  createRoom,
  editRoom,
  getRoom,
  getRooms
} from '../services/roomService.js'
import {
  createRoomSchema,
  updateRoomSchema
} from '../validation/roomSchemas.js'
import { parsePageQuery, validateBody } from '../validation/common.js'

export const roomRoutes = Router()

roomRoutes.get('/', (req, res) => {
  const query = parsePageQuery(req.query)
  const result = getRooms(query)

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

roomRoutes.get('/:id', (req, res) => {
  res.json({ data: getRoom(req.params.id) })
})

roomRoutes.post('/', validateBody(createRoomSchema), (req, res) => {
  res.status(201).json({ data: createRoom(req.validatedBody) })
})

roomRoutes.patch('/:id', validateBody(updateRoomSchema), (req, res) => {
  res.json({ data: editRoom(req.params.id, req.validatedBody) })
})
