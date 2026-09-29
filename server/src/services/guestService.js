import { randomUUID } from 'node:crypto'
import {
  deleteGuest,
  getGuestById,
  insertGuest,
  listGuests,
  updateGuest
} from '../repositories/guestRepository.js'
import { HttpError } from '../utils/HttpError.js'

export function getGuests(query) {
  return listGuests(query)
}

export function getGuest(id) {
  const guest = getGuestById(id)
  if (!guest) throw new HttpError(404, 'GUEST_NOT_FOUND', 'Guest not found.')
  return guest
}

export function createGuest(values) {
  return insertGuest({ id: values.id || randomUUID(), ...values })
}

export function editGuest(id, values) {
  getGuest(id)
  return updateGuest(id, values)
}

export function removeGuest(id) {
  getGuest(id)
  deleteGuest(id)
}
