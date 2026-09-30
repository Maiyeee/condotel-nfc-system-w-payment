import { apiClient } from '@/lib/apiClient'
import { cleanParams } from './apiHelpers'

export async function listReservations(params = {}) {
  const response = await apiClient.get('/reservations', {
    params: cleanParams(params),
  })
  return response.data
}

export async function getReservation(id) {
  const response = await apiClient.get(`/reservations/${id}`)
  return response.data.data
}

export async function getReservationsSummary() {
  const response = await apiClient.get('/reservations/summary')
  return response.data.data
}

export async function createReservation(payload) {
  const response = await apiClient.post('/reservations', payload)
  return response.data.data
}

export async function updateReservation(id, payload) {
  const response = await apiClient.patch(`/reservations/${id}`, payload)
  return response.data.data
}

export async function deleteReservation(id) {
  await apiClient.delete(`/reservations/${id}`)
}
