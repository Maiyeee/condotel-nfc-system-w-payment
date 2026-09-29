import { z } from 'zod'

const guestStatusSchema = z.enum(['active', 'inactive'])

const emailSchema = z
  .string()
  .trim()
  .max(200)
  .refine((value) => value === '' || z.string().email().safeParse(value).success, {
    message: 'Enter a valid email address.'
  })

export const createGuestSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(150),
  email: emailSchema.default(''),
  phone: z.string().trim().min(7, 'Enter a valid phone number.').max(50),
  idNumber: z.string().trim().max(100).optional().default(''),
  address: z.string().trim().max(500).optional().default(''),
  status: guestStatusSchema.default('active')
})

export const updateGuestSchema = z
  .object({
    version: z.coerce.number().int().min(1),
    name: z.string().trim().min(2).max(150).optional(),
    email: emailSchema.optional(),
    phone: z.string().trim().min(7).max(50).optional(),
    idNumber: z.string().trim().max(100).optional(),
    address: z.string().trim().max(500).optional(),
    status: guestStatusSchema.optional()
  })
  .refine((value) => Object.keys(value).some((key) => key !== 'version'), {
    message: 'At least one guest field is required.'
  })

export const guestListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional().default(''),
  status: guestStatusSchema.optional()
})
