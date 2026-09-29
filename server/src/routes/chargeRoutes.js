import { Router } from 'express'
import {
  createCharge,
  getCharge,
  getChargesForReservation
} from '../services/chargeService.js'
import { createChargeSchema } from '../validation/chargeSchemas.js'
import { validateBody } from '../validation/common.js'

export const chargeRoutes = Router()
export const reservationChargeRoutes = Router({ mergeParams: true })

reservationChargeRoutes.get('/', (req, res) => {
  res.json({ data: getChargesForReservation(req.params.reservationId) })
})

reservationChargeRoutes.post(
  '/',
  validateBody(createChargeSchema),
  (req, res) => {
    const charge = createCharge(req.params.reservationId, req.validatedBody)
    res.status(201).json({ data: charge })
  }
)

chargeRoutes.get('/:id', (req, res) => {
  res.json({ data: getCharge(req.params.id) })
})
