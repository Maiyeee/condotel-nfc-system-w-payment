import { randomUUID } from 'node:crypto'
import {
  countReservationsForGuest,
  deleteGuest,
  findGuestByEmail,
  findGuestByIdNumber,
  getGuestById,
  insertGuest,
  listGuests,
  updateGuestWithVersion
} from '../repositories/guestRepository.js'
import { HttpError } from '../utils/HttpError.js'

function normalizeGuest(values) {
  const result = { ...values }

  if (typeof result.name === 'string') result.name = result.name.trim()
  if (typeof result.email === 'string') result.email = result.email.trim().toLowerCase()
  if (typeof result.phone === 'string') result.phone = result.phone.trim()
  if (typeof result.idNumber === 'string') result.idNumber = result.idNumber.trim()
  if (typeof result.address === 'string') result.address = result.address.trim()

  return result
}

function assertUniqueGuestFields(values, excludeId = null) {
  if (values.email && findGuestByEmail(values.email, excludeId)) {
    throw new HttpError(
      409,
      'GUEST_EMAIL_EXISTS',
      'Another guest already uses this email address.'
    )
  }

  if (values.idNumber && findGuestByIdNumber(values.idNumber, excludeId)) {
    throw new HttpError(
      409,
      'GUEST_ID_NUMBER_EXISTS',
      'Another guest already uses this ID number.'
    )
  }
}

export function getGuests(query) {
  return listGuests(query)
}

export function getGuest(id) {
  const guest = getGuestById(id)
  if (!guest) throw new HttpError(404, 'GUEST_NOT_FOUND', 'Guest not found.')
  return guest
}

export function createGuest(values) {
  const normalized = normalizeGuest(values)
  assertUniqueGuestFields(normalized)

  return insertGuest({
    id: normalized.id || randomUUID(),
    name: normalized.name,
    email: normalized.email || '',
    phone: normalized.phone,
    idNumber: normalized.idNumber || '',
    address: normalized.address || '',
    status: normalized.status || 'active'
  })
}

export function editGuest(id, values) {
  const current = getGuest(id)
  const normalized = normalizeGuest(values)
  const { version, ...changes } = normalized

  assertUniqueGuestFields(changes, id)

  if (current.version !== version) {
    throw new HttpError(
      409,
      'STALE_GUEST_VERSION',
      'This guest was changed by another request. Refresh the guest record and try again.',
      { currentVersion: current.version }
    )
  }

  const result = updateGuestWithVersion(id, version, changes)

  if (result.changes !== 1) {
    const latest = getGuestById(id)

    if (!latest) {
      throw new HttpError(404, 'GUEST_NOT_FOUND', 'Guest not found.')
    }

    throw new HttpError(
      409,
      'STALE_GUEST_VERSION',
      'This guest was changed by another request. Refresh the guest record and try again.',
      { currentVersion: latest.version }
    )
  }

  return result.guest
}

export function removeGuest(id) {
  getGuest(id)

  const reservationCount = countReservationsForGuest(id)
  if (reservationCount > 0) {
    throw new HttpError(
      409,
      'GUEST_HAS_RESERVATIONS',
      'Guests with reservation history cannot be deleted. Set the guest status to inactive instead.',
      { reservationCount }
    )
  }

  deleteGuest(id)
}
