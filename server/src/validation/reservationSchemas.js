import { z } from 'zod'
import { dateSchema } from './common.js'

export const reservationStatusSchema = z.enum([
  'Pending',
  'Confirmed',
  'Checked-in',
  'Checked-out',
  'Cancelled'
])

export const createReservationSchema = z
  .object({
    id: z.string().min(1).max(100).optional(),
    referenceNo: z.string().trim().min(1).max(100).optional(),
    guestId: z.string().min(1).max(100),
    roomId: z.string().min(1).max(100),
    checkIn: dateSchema,
    checkOut: dateSchema,
    status: reservationStatusSchema.default('Pending'),
    notes: z.string().trim().max(1000).default('')
  })
  .refine((value) => value.checkOut > value.checkIn, {
    message: 'checkOut must be later than checkIn.',
    path: ['checkOut']
  })

export const updateReservationSchema = z
  .object({
    version: z.number().int().min(1),
    guestId: z.string().min(1).max(100).optional(),
    roomId: z.string().min(1).max(100).optional(),
    checkIn: dateSchema.optional(),
    checkOut: dateSchema.optional(),
    status: reservationStatusSchema.optional(),
    notes: z.string().trim().max(1000).optional()
  })
  .refine((value) => Object.keys(value).some((key) => key !== 'version'), {
    message: 'At least one editable field is required.'
  })
