import { z } from 'zod'

export const manualChargeTypeSchema = z.enum([
  'Charge',
  'Discount',
  'Adjustment'
])

export const createChargeSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(200),
  amountCentavos: z.number().int().min(0).max(1_000_000_000),
  quantity: z.number().int().min(1).max(1000).default(1),
  chargeType: manualChargeTypeSchema.default('Charge')
})

export const updateChargeSchema = z
  .object({
    version: z.number().int().min(1),
    description: z.string().trim().min(1).max(200).optional(),
    amountCentavos: z.number().int().min(0).max(1_000_000_000).optional(),
    quantity: z.number().int().min(1).max(1000).optional(),
    chargeType: manualChargeTypeSchema.optional()
  })
  .refine((value) => Object.keys(value).some((key) => key !== 'version'), {
    message: 'At least one editable field is required.'
  })
