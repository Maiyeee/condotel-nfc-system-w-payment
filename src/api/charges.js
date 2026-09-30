import { apiClient } from '@/lib/apiClient'

export async function listReservationCharges(reservationId) {
  const response = await apiClient.get(`/reservations/${reservationId}/charges`)
  return response.data
}

export async function createReservationCharge(reservationId, payload) {
  const response = await apiClient.post(`/reservations/${reservationId}/charges`, payload)
  return response.data
}

export async function updateCharge(id, payload) {
  const response = await apiClient.patch(`/charges/${id}`, payload)
  return response.data
}

export async function deleteCharge(id) {
  const response = await apiClient.delete(`/charges/${id}`)
  return response.data
}
