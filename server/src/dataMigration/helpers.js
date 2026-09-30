import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export function readJsonFile(filePath) {
  const absolute = path.resolve(filePath)
  return {
    absolute,
    text: fs.readFileSync(absolute, 'utf8'),
  }
}

export function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

export function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function cleanText(value, fallback = '') {
  if (value === null || value === undefined) return fallback
  return String(value).trim()
}

export function firstValue(object, keys, fallback = undefined) {
  for (const key of keys) {
    const value = object?.[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') return value
  }
  return fallback
}

export function numberValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const normalized = value.replace(/[₱,$\s]/g, '').replace(/,/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function toCentavos(object) {
  const direct = numberValue(firstValue(object, [
    'rateCentavos', 'rate_centavos', 'amountCentavos', 'amount_centavos',
    'nightlyRateCentavos', 'nightly_rate_centavos'
  ]))
  if (direct !== null) return Math.max(0, Math.round(direct))

  const pesos = numberValue(firstValue(object, [
    'rate', 'price', 'nightlyRate', 'nightly_rate', 'amount', 'roomRate', 'room_rate'
  ]))
  if (pesos !== null) return Math.max(0, Math.round(pesos * 100))

  return 0
}

export function toIsoDate(value) {
  const raw = cleanText(value)
  if (!raw) return ''
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

export function nightsBetween(checkIn, checkOut) {
  const start = new Date(`${checkIn}T00:00:00Z`)
  const end = new Date(`${checkOut}T00:00:00Z`)
  const diff = Math.round((end - start) / 86400000)
  return Number.isFinite(diff) && diff > 0 ? diff : 0
}

export function normalizeGuestStatus(value) {
  return cleanText(value).toLowerCase() === 'inactive' ? 'Inactive' : 'Active'
}

export function normalizeRoomStatus(value) {
  const status = cleanText(value, 'Available').toLowerCase().replace(/[_-]/g, ' ')
  if (status === 'occupied') return 'Occupied'
  if (status === 'maintenance' || status === 'under maintenance') return 'Maintenance'
  if (status === 'out of service' || status === 'outofservice') return 'Out of Service'
  return 'Available'
}

export function normalizeReservationStatus(value) {
  const status = cleanText(value, 'Pending').toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ')
  if (['confirmed', 'reserved', 'booked'].includes(status)) return 'Confirmed'
  if (['checked in', 'checkedin', 'active'].includes(status)) return 'Checked-in'
  if (['checked out', 'checkedout', 'completed'].includes(status)) return 'Checked-out'
  if (['cancelled', 'canceled'].includes(status)) return 'Cancelled'
  return 'Pending'
}

export function slug(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function makeMigrationReference(legacyId, index) {
  const suffix = slug(legacyId).slice(-14) || String(index + 1).padStart(4, '0')
  return `MIG-${suffix.toUpperCase()}`
}

export function ensureArray(value) {
  if (Array.isArray(value)) return value
  if (value && Array.isArray(value.data)) return value.data
  if (value && Array.isArray(value.items)) return value.items
  if (value && Array.isArray(value.records)) return value.records
  return []
}

export function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
