import { z } from 'zod'

export const createChargeSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(200),
  amountCentavos: z.number().int().min(0),
  quantity: z.number().int().min(1).max(1000).default(1)
})
