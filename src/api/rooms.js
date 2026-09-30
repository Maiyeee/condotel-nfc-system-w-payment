import { apiClient } from '@/lib/apiClient'
import { cleanParams } from './apiHelpers'

export async function listRooms(params = {}) {
  const response = await apiClient.get('/rooms', { params: cleanParams(params) })
  return response.data
}

export async function getRoom(id) {
  const response = await apiClient.get(`/rooms/${id}`)
  return response.data.data
}

export async function getRoomsSummary() {
  const response = await apiClient.get('/rooms/summary')
  return response.data.data
}

export async function getAvailableRooms(params) {
  const response = await apiClient.get('/rooms/availability', {
    params: cleanParams(params),
  })
  return response.data
}

export async function createRoom(payload) {
  const response = await apiClient.post('/rooms', payload)
  return response.data.data
}

export async function updateRoom(id, payload) {
  const response = await apiClient.patch(`/rooms/${id}`, payload)
  return response.data.data
}

export async function deleteRoom(id) {
  await apiClient.delete(`/rooms/${id}`)
}
