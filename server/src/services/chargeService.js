import { randomUUID } from 'node:crypto'
import {
  getChargeById,
  insertCharge,
  listChargesForReservation
} from '../repositories/chargeRepository.js'
import { getReservationById } from '../repositories/reservationRepository.js'
import { HttpError } from '../utils/HttpError.js'

function requireReservation(id) {
  const reservation = getReservationById(id)
  if (!reservation) {
    throw new HttpError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found.')
  }
  return reservation
}

export function getChargesForReservation(reservationId) {
  requireReservation(reservationId)
  return listChargesForReservation(reservationId)
}

export function getCharge(id) {
  const charge = getChargeById(id)
  if (!charge) throw new HttpError(404, 'CHARGE_NOT_FOUND', 'Charge not found.')
  return charge
}

export function createCharge(reservationId, values) {
  requireReservation(reservationId)

  return insertCharge({
    id: values.id || randomUUID(),
    reservationId,
    description: values.description,
    amountCentavos: values.amountCentavos,
    quantity: values.quantity
  })
}
