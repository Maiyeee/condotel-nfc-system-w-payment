import { randomUUID } from 'node:crypto'
import {
  countReservationsForRoom,
  deleteRoom,
  findRoomByNumber,
  getRoomById,
  getRoomSummary,
  getRoomWithReservations,
  insertRoom,
  listAvailableRoomsForStay,
  listRooms,
  updateRoomWithVersion
} from '../repositories/roomRepository.js'
import { HttpError } from '../utils/HttpError.js'

function normalizeRoom(values) {
  const result = { ...values }

  if (typeof result.roomNumber === 'string') result.roomNumber = result.roomNumber.trim()
  if (typeof result.name === 'string') result.name = result.name.trim()
  if (typeof result.type === 'string') result.type = result.type.trim()

  return result
}

function assertUniqueRoomNumber(roomNumber, excludeId = null) {
  if (!roomNumber) return

  if (findRoomByNumber(roomNumber, excludeId)) {
    throw new HttpError(
      409,
      'ROOM_NUMBER_EXISTS',
      'Another room already uses this room number.'
    )
  }
}

export function getRooms(query) {
  return listRooms(query)
}

export function getRoom(id) {
  const room = getRoomWithReservations(id)
  if (!room) throw new HttpError(404, 'ROOM_NOT_FOUND', 'Room not found.')
  return room
}

export function createRoom(values) {
  const normalized = normalizeRoom(values)
  assertUniqueRoomNumber(normalized.roomNumber)

  return insertRoom({
    id: normalized.id || randomUUID(),
    roomNumber: normalized.roomNumber,
    name: normalized.name,
    type: normalized.type,
    rateCentavos: normalized.rateCentavos,
    status: normalized.status || 'Available'
  })
}

export function editRoom(id, values) {
  const current = getRoomById(id)
  if (!current) throw new HttpError(404, 'ROOM_NOT_FOUND', 'Room not found.')

  const normalized = normalizeRoom(values)
  const { version, ...changes } = normalized

  if (changes.roomNumber) assertUniqueRoomNumber(changes.roomNumber, id)

  if (current.version !== version) {
    throw new HttpError(
      409,
      'STALE_ROOM_VERSION',
      'This room was changed by another request. Refresh the room record and try again.',
      { currentVersion: current.version }
    )
  }

  const result = updateRoomWithVersion(id, version, changes)

  if (result.changes !== 1) {
    const latest = getRoomById(id)

    if (!latest) throw new HttpError(404, 'ROOM_NOT_FOUND', 'Room not found.')

    throw new HttpError(
      409,
      'STALE_ROOM_VERSION',
      'This room was changed by another request. Refresh the room record and try again.',
      { currentVersion: latest.version }
    )
  }

  return result.room
}

export function removeRoom(id) {
  const room = getRoomById(id)
  if (!room) throw new HttpError(404, 'ROOM_NOT_FOUND', 'Room not found.')

  const reservationCount = countReservationsForRoom(id)
  if (reservationCount > 0) {
    throw new HttpError(
      409,
      'ROOM_HAS_RESERVATIONS',
      'Rooms with reservation history cannot be deleted. Change the room status instead.',
      { reservationCount }
    )
  }

  deleteRoom(id)
}

export function getAvailableRooms(values) {
  if (values.checkOut <= values.checkIn) {
    throw new HttpError(
      400,
      'INVALID_STAY_DATES',
      'checkOut must be later than checkIn.'
    )
  }

  return listAvailableRoomsForStay(values)
}

export function getRoomsSummary() {
  return getRoomSummary()
}
