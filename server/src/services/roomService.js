import { randomUUID } from 'node:crypto'
import {
  getRoomById,
  insertRoom,
  listRooms,
  updateRoom
} from '../repositories/roomRepository.js'
import { HttpError } from '../utils/HttpError.js'

export function getRooms(query) {
  return listRooms(query)
}

export function getRoom(id) {
  const room = getRoomById(id)
  if (!room) throw new HttpError(404, 'ROOM_NOT_FOUND', 'Room not found.')
  return room
}

export function createRoom(values) {
  return insertRoom({ id: values.id || randomUUID(), ...values })
}

export function editRoom(id, values) {
  getRoom(id)
  return updateRoom(id, values)
}
