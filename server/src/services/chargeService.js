import { randomUUID } from 'node:crypto'
import {
  deleteCharge,
  getChargeById,
  getChargeSummaryForReservation,
  insertCharge,
  listChargesForReservation,
  updateChargeWithVersion
} from '../repositories/chargeRepository.js'
import { getReservationById } from '../repositories/reservationRepository.js'
import { HttpError } from '../utils/HttpError.js'

const LOCKED_RESERVATION_STATUSES = new Set(['Checked-out', 'Cancelled'])

function requireReservation(id) {
  const reservation = getReservationById(id)
  if (!reservation) {
    throw new HttpError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found.')
  }
  return reservation
}

function requireEditableReservation(id) {
  const reservation = requireReservation(id)

  if (LOCKED_RESERVATION_STATUSES.has(reservation.status)) {
    throw new HttpError(
      409,
      'RESERVATION_CHARGES_LOCKED',
      'Charges cannot be changed after checkout or cancellation.'
    )
  }

  return reservation
}

function requireEditableCharge(id) {
  const charge = getCharge(id)

  if (charge.source === 'room_rate') {
    throw new HttpError(
      409,
      'ROOM_RATE_CHARGE_PROTECTED',
      'The room-rate charge is managed by the reservation and cannot be edited directly.'
    )
  }

  requireEditableReservation(charge.reservationId)
  return charge
}

export function getChargesForReservation(reservationId) {
  requireReservation(reservationId)

  return {
    charges: listChargesForReservation(reservationId),
    summary: getChargeSummaryForReservation(reservationId)
  }
}

export function getCharge(id) {
  const charge = getChargeById(id)
  if (!charge) throw new HttpError(404, 'CHARGE_NOT_FOUND', 'Charge not found.')
  return charge
}

export function createCharge(reservationId, values) {
  requireEditableReservation(reservationId)

  const charge = insertCharge({
    id: values.id || randomUUID(),
    reservationId,
    description: values.description,
    amountCentavos: values.amountCentavos,
    quantity: values.quantity,
    chargeType: values.chargeType,
    source: 'manual'
  })

  return {
    charge,
    summary: getChargeSummaryForReservation(reservationId)
  }
}

export function editCharge(id, values) {
  const current = requireEditableCharge(id)

  if (current.version !== values.version) {
    throw new HttpError(
      409,
      'STALE_CHARGE_VERSION',
      'This charge was changed by another request. Reload it before saving.',
      { currentVersion: current.version }
    )
  }

  const { version, ...changes } = values
  const result = updateChargeWithVersion(id, version, changes)

  if (result.changes !== 1) {
    const latest = getChargeById(id)

    if (!latest) throw new HttpError(404, 'CHARGE_NOT_FOUND', 'Charge not found.')

    throw new HttpError(
      409,
      'STALE_CHARGE_VERSION',
      'This charge was changed by another request. Reload it before saving.',
      { currentVersion: latest.version }
    )
  }

  return {
    charge: getCharge(id),
    summary: getChargeSummaryForReservation(current.reservationId)
  }
}

export function removeCharge(id) {
  const current = requireEditableCharge(id)
  deleteCharge(id)

  return getChargeSummaryForReservation(current.reservationId)
}
