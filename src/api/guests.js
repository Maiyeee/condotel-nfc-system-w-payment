import { apiClient } from '@/lib/apiClient'
import { cleanParams } from './apiHelpers'

export async function listGuests(params = {}) {
  const response = await apiClient.get('/guests', { params: cleanParams(params) })
  return response.data
}

export async function getGuest(id) {
  const response = await apiClient.get(`/guests/${id}`)
  return response.data.data
}

export async function createGuest(payload) {
  const response = await apiClient.post('/guests', payload)
  return response.data.data
}

export async function updateGuest(id, payload) {
  const response = await apiClient.patch(`/guests/${id}`, payload)
  return response.data.data
}

export async function deleteGuest(id) {
  await apiClient.delete(`/guests/${id}`)
}
