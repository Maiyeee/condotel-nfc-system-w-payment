import { z } from 'zod'

const roomStatus = z.enum([
  'Available',
  'Occupied',
  'Maintenance',
  'Out of Service'
])

export const createRoomSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  roomNumber: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(150),
  type: z.string().trim().min(1).max(100),
  rateCentavos: z.number().int().min(0),
  status: roomStatus.default('Available')
})

export const updateRoomSchema = z
  .object({
    roomNumber: z.string().trim().min(1).max(50).optional(),
    name: z.string().trim().min(1).max(150).optional(),
    type: z.string().trim().min(1).max(100).optional(),
    rateCentavos: z.number().int().min(0).optional(),
    status: roomStatus.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.'
  })
