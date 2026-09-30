import { z } from 'zod'
import { dateSchema } from './common.js'

export const roomStatusSchema = z.enum([
  'Available',
  'Occupied',
  'Maintenance',
  'Out of Service'
])

export const createRoomSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  roomNumber: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(150),
  type: z.string().trim().min(1).max(100),
  rateCentavos: z.coerce.number().int().min(0),
  status: roomStatusSchema.default('Available')
})

export const updateRoomSchema = z
  .object({
    version: z.coerce.number().int().min(1),
    roomNumber: z.string().trim().min(1).max(50).optional(),
    name: z.string().trim().min(1).max(150).optional(),
    type: z.string().trim().min(1).max(100).optional(),
    rateCentavos: z.coerce.number().int().min(0).optional(),
    status: roomStatusSchema.optional()
  })
  .refine((value) => Object.keys(value).some((key) => key !== 'version'), {
    message: 'At least one room field is required.'
  })

export const roomListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional().default(''),
  status: roomStatusSchema.optional(),
  type: z.string().trim().max(100).optional().default('')
})

export const roomAvailabilityQuerySchema = z.object({
  checkIn: dateSchema,
  checkOut: dateSchema,
  type: z.string().trim().max(100).optional().default('')
})
