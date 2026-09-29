import { z } from 'zod'

const status = z.enum(['Active', 'Inactive'])

export const createGuestSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(150),
  email: z.union([z.literal(''), z.string().email().max(200)]).default(''),
  phone: z.string().trim().max(50).default(''),
  address: z.string().trim().max(500).default(''),
  status: status.default('Active')
})

export const updateGuestSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    email: z.union([z.literal(''), z.string().email().max(200)]).optional(),
    phone: z.string().trim().max(50).optional(),
    address: z.string().trim().max(500).optional(),
    status: status.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.'
  })
