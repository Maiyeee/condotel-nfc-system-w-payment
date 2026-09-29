import { z } from 'zod'
import { HttpError } from '../utils/HttpError.js'

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const parsed = new Date(Date.UTC(year, month - 1, day))

    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    )
  }, 'Use a valid calendar date.')

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return next(
        new HttpError(
          400,
          'VALIDATION_ERROR',
          'The request body is invalid.',
          result.error.flatten()
        )
      )
    }

    req.validatedBody = result.data
    next()
  }
}

export function parsePageQuery(query) {
  const result = z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      search: z.string().trim().max(200).optional().default(''),
      status: z.string().trim().max(50).optional()
    })
    .safeParse(query)

  if (!result.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'The query parameters are invalid.',
      result.error.flatten()
    )
  }

  return result.data
}
