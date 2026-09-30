import { Router } from 'express'
import {
  createCharge,
  editCharge,
  getCharge,
  getChargesForReservation,
  removeCharge
} from '../services/chargeService.js'
import {
  createChargeSchema,
  updateChargeSchema
} from '../validation/chargeSchemas.js'
import { validateBody } from '../validation/common.js'

export const chargeRoutes = Router()
export const reservationChargeRoutes = Router({ mergeParams: true })

reservationChargeRoutes.get('/', (req, res) => {
  const result = getChargesForReservation(req.params.reservationId)
  res.json({ data: result.charges, summary: result.summary })
})

reservationChargeRoutes.post(
  '/',
  validateBody(createChargeSchema),
  (req, res) => {
    const result = createCharge(req.params.reservationId, req.validatedBody)
    res.status(201).json({ data: result.charge, summary: result.summary })
  }
)

chargeRoutes.get('/:id', (req, res) => {
  res.json({ data: getCharge(req.params.id) })
})

chargeRoutes.patch(
  '/:id',
  validateBody(updateChargeSchema),
  (req, res) => {
    const result = editCharge(req.params.id, req.validatedBody)
    res.json({ data: result.charge, summary: result.summary })
  }
)

chargeRoutes.put(
  '/:id',
  validateBody(updateChargeSchema),
  (req, res) => {
    const result = editCharge(req.params.id, req.validatedBody)
    res.json({ data: result.charge, summary: result.summary })
  }
)

chargeRoutes.delete('/:id', (req, res) => {
  const summary = removeCharge(req.params.id)
  res.json({ data: null, summary })
})
