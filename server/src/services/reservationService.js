import { randomBytes, randomUUID } from 'node:crypto'
import { db } from '../db/database.js'
import {
  getChargeSummaryForReservation,
  listChargesForReservation,
  upsertRoomRateCharge
} from '../repositories/chargeRepository.js'
import { getGuestById } from '../repositories/guestRepository.js'
import { getRoomById } from '../repositories/roomRepository.js'
import {
  deleteReservation,
  findOverlap,
  getReservationById,
  getReservationSummary,
  insertReservation,
  listReservations,
  updateReservationWithVersion
} from '../repositories/reservationRepository.js'
import { HttpError } from '../utils/HttpError.js'

function makeReferenceNo() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = randomBytes(3).toString('hex').toUpperCase()
  return `RSV-${date}-${suffix}`
}

function requireGuest(id) {
  const guest = getGuestById(id)

  if (!guest) {
    throw new HttpError(400, 'INVALID_GUEST', 'The selected guest does not exist.')
  }

  return guest
}

function requireRoomExists(id) {
  const room = getRoomById(id)

  if (!room) {
    throw new HttpError(400, 'INVALID_ROOM', 'The selected room does not exist.')
  }

  return room
}

function requireReservableRoom(id) {
  const room = requireRoomExists(id)

  if (room.status === 'Out of Service' || room.status === 'Maintenance') {
    throw new HttpError(
      409,
      'ROOM_UNAVAILABLE',
      'The selected room is not available for reservations.'
    )
  }

  return room
}

function validateDates(checkIn, checkOut) {
  if (checkOut <= checkIn) {
    throw new HttpError(
      400,
      'INVALID_STAY_DATES',
      'checkOut must be later than checkIn.'
    )
  }
}

function stayNights(checkIn, checkOut) {
  const start = Date.parse(`${checkIn}T00:00:00Z`)
  const end = Date.parse(`${checkOut}T00:00:00Z`)
  return Math.round((end - start) / 86_400_000)
}

function rejectOverlap({ roomId, checkIn, checkOut, excludeId }) {
  const overlap = findOverlap({ roomId, checkIn, checkOut, excludeId })

  if (overlap) {
    throw new HttpError(
      409,
      'RESERVATION_OVERLAP',
      'The room already has an overlapping active reservation.',
      {
        conflictingReservationId: overlap.id,
        referenceNo: overlap.reference_no,
        checkIn: overlap.check_in,
        checkOut: overlap.check_out,
        status: overlap.status
      }
    )
  }
}

function syncRoomRateCharge(reservation, room) {
  const nights = stayNights(reservation.checkIn, reservation.checkOut)

  return upsertRoomRateCharge({
    id: randomUUID(),
    reservationId: reservation.id,
    description: `${room.name} room rate`,
    amountCentavos: room.rateCentavos,
    quantity: nights
  })
}

function withCharges(reservation) {
  return {
    ...reservation,
    charges: listChargesForReservation(reservation.id),
    chargeSummary: getChargeSummaryForReservation(reservation.id)
  }
}

export function getReservations(query) {
  return listReservations(query)
}

export function getReservationsSummary() {
  return getReservationSummary()
}

export function getReservation(id) {
  const reservation = getReservationById(id)
  if (!reservation) {
    throw new HttpError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found.')
  }
  return withCharges(reservation)
}

const createTransaction = db.transaction((values) => {
  requireGuest(values.guestId)
  const room = requireReservableRoom(values.roomId)
  validateDates(values.checkIn, values.checkOut)

  if (!['Checked-out', 'Cancelled'].includes(values.status)) {
    rejectOverlap(values)
  }

  const reservation = insertReservation(values)
  syncRoomRateCharge(reservation, room)
  return getReservation(values.id)
})

export function createReservation(values) {
  const id = values.id || randomUUID()

  return createTransaction({
    id,
    referenceNo: values.referenceNo || makeReferenceNo(),
    guestId: values.guestId,
    roomId: values.roomId,
    checkIn: values.checkIn,
    checkOut: values.checkOut,
    status: values.status,
    notes: values.notes
  })
}

const updateTransaction = db.transaction((id, values) => {
  const current = getReservation(id)

  const merged = {
    guestId: values.guestId ?? current.guestId,
    roomId: values.roomId ?? current.roomId,
    checkIn: values.checkIn ?? current.checkIn,
    checkOut: values.checkOut ?? current.checkOut,
    status: values.status ?? current.status,
    notes: values.notes ?? current.notes
  }

  requireGuest(merged.guestId)
  const room = requireRoomExists(merged.roomId)

  if (
    (values.roomId || current.roomId !== merged.roomId) &&
    !['Checked-out', 'Cancelled'].includes(merged.status)
  ) {
    requireReservableRoom(merged.roomId)
  }

  validateDates(merged.checkIn, merged.checkOut)

  if (!['Checked-out', 'Cancelled'].includes(merged.status)) {
    rejectOverlap({
      roomId: merged.roomId,
      checkIn: merged.checkIn,
      checkOut: merged.checkOut,
      excludeId: id
    })
  }

  const editable = Object.fromEntries(
    Object.entries(values).filter(([key]) => key !== 'version')
  )

  const result = updateReservationWithVersion(id, values.version, editable)

  if (result.changes === 0) {
    const latest = getReservationById(id)

    throw new HttpError(
      409,
      'STALE_RESERVATION_VERSION',
      'This reservation changed in another session. Reload it before saving.',
      latest ? { currentVersion: latest.version } : null
    )
  }

  const updated = getReservationById(id)
  const pricingChanged =
    merged.roomId !== current.roomId ||
    merged.checkIn !== current.checkIn ||
    merged.checkOut !== current.checkOut

  if (pricingChanged) syncRoomRateCharge(updated, room)

  return getReservation(id)
})

export function editReservation(id, values) {
  return updateTransaction(id, values)
}

export function removeReservation(id) {
  const current = getReservation(id)

  if (current.status === 'Checked-in' || current.status === 'Checked-out') {
    throw new HttpError(
      409,
      'RESERVATION_DELETE_BLOCKED',
      'Checked-in and checked-out reservations must be retained.'
    )
  }

  deleteReservation(id)
}
