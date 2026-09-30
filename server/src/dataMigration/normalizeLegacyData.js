import {
  cleanText,
  firstValue,
  normalizeGuestStatus,
  normalizeReservationStatus,
  normalizeRoomStatus,
  toCentavos,
  toIsoDate,
} from './helpers.js'
import { arraysFromEntry } from './readLegacyExport.js'

function keyCategory(key) {
  const lower = String(key || '').toLowerCase()
  if (/(payment|transaction|nfc|setting|notification|report)/.test(lower)) return 'deferred'
  if (/(guest|customer)/.test(lower)) return 'guest'
  if (/(room)/.test(lower)) return 'room'
  if (/(reservation|booking)/.test(lower)) return 'reservation'
  if (/(charge)/.test(lower)) return 'charge'
  return 'unknown'
}

function inferCategoryFromItem(item) {
  if (!item || typeof item !== 'object') return 'unknown'
  if (firstValue(item, ['checkIn', 'check_in', 'checkInDate', 'arrival', 'arrivalDate']) && firstValue(item, ['checkOut', 'check_out', 'checkOutDate', 'departure', 'departureDate'])) return 'reservation'
  if (firstValue(item, ['roomNumber', 'room_number', 'number']) && firstValue(item, ['rate', 'price', 'rateCentavos', 'rate_centavos', 'nightlyRate'])) return 'room'
  if (firstValue(item, ['email', 'phone', 'idNumber', 'id_number']) && firstValue(item, ['name', 'fullName', 'guestName'])) return 'guest'
  return 'unknown'
}

function normalizeGuest(item, sourceKey, index) {
  const normalized = {
    legacyId: cleanText(firstValue(item, ['id', 'guestId', 'guest_id', 'customerId', 'customer_id'], `guest-${index + 1}`)),
    name: cleanText(firstValue(item, ['name', 'fullName', 'full_name', 'guestName', 'guest_name'])),
    email: cleanText(firstValue(item, ['email', 'emailAddress', 'email_address'])).toLowerCase(),
    phone: cleanText(firstValue(item, ['phone', 'phoneNumber', 'phone_number', 'contact'])),
    idNumber: cleanText(firstValue(item, ['idNumber', 'id_number', 'identificationNumber', 'identification_number', 'validId'])),
    address: cleanText(firstValue(item, ['address', 'homeAddress', 'home_address'])),
    status: normalizeGuestStatus(firstValue(item, ['status'], 'Active')),
  }
  const issues = []
  if (!normalized.name) issues.push('Missing guest name')
  return { sourceKey, index, raw: item, normalized, issues }
}

function normalizeRoom(item, sourceKey, index) {
  const roomNumber = cleanText(firstValue(item, ['roomNumber', 'room_number', 'number', 'roomNo', 'room_no']))
  const normalized = {
    legacyId: cleanText(firstValue(item, ['id', 'roomId', 'room_id'], roomNumber || `room-${index + 1}`)),
    roomNumber,
    name: cleanText(firstValue(item, ['name', 'roomName', 'room_name'], roomNumber ? `Room ${roomNumber}` : '')),
    type: cleanText(firstValue(item, ['type', 'roomType', 'room_type', 'category'], 'Standard')),
    rateCentavos: toCentavos(item),
    status: normalizeRoomStatus(firstValue(item, ['status'], 'Available')),
  }
  const issues = []
  if (!normalized.roomNumber) issues.push('Missing room number')
  if (!normalized.name) issues.push('Missing room name')
  return { sourceKey, index, raw: item, normalized, issues }
}

function normalizeReservation(item, sourceKey, index) {
  const guestValue = firstValue(item, ['guest'])
  const roomValue = firstValue(item, ['room'])
  const normalized = {
    legacyId: cleanText(firstValue(item, ['id', 'reservationId', 'reservation_id', 'bookingId', 'booking_id'], `reservation-${index + 1}`)),
    referenceNo: cleanText(firstValue(item, ['referenceNo', 'reference_no', 'reference', 'confirmationNo', 'confirmation_no', 'bookingReference'])),
    guestId: cleanText(firstValue(item, ['guestId', 'guest_id', 'customerId', 'customer_id'], typeof guestValue === 'object' ? firstValue(guestValue, ['id']) : '')),
    guestName: cleanText(firstValue(item, ['guestName', 'guest_name'], typeof guestValue === 'string' ? guestValue : typeof guestValue === 'object' ? firstValue(guestValue, ['name']) : '')),
    guestEmail: cleanText(firstValue(item, ['guestEmail', 'guest_email'], typeof guestValue === 'object' ? firstValue(guestValue, ['email']) : '')).toLowerCase(),
    roomId: cleanText(firstValue(item, ['roomId', 'room_id'], typeof roomValue === 'object' ? firstValue(roomValue, ['id']) : '')),
    roomNumber: cleanText(firstValue(item, ['roomNumber', 'room_number'], typeof roomValue === 'string' ? roomValue : typeof roomValue === 'object' ? firstValue(roomValue, ['roomNumber', 'room_number', 'number']) : '')),
    checkIn: toIsoDate(firstValue(item, ['checkIn', 'check_in', 'checkInDate', 'check_in_date', 'arrival', 'arrivalDate'])),
    checkOut: toIsoDate(firstValue(item, ['checkOut', 'check_out', 'checkOutDate', 'check_out_date', 'departure', 'departureDate'])),
    status: normalizeReservationStatus(firstValue(item, ['status'], 'Pending')),
    notes: cleanText(firstValue(item, ['notes', 'note', 'remarks', 'specialRequests', 'special_requests'])),
    nightlyRateCentavos: toCentavos(item),
  }
  const issues = []
  if (!normalized.checkIn) issues.push('Missing or invalid check-in date')
  if (!normalized.checkOut) issues.push('Missing or invalid check-out date')
  if (normalized.checkIn && normalized.checkOut && normalized.checkOut <= normalized.checkIn) issues.push('Check-out must be after check-in')
  if (!normalized.guestId && !normalized.guestName && !normalized.guestEmail) issues.push('Guest relationship is missing')
  if (!normalized.roomId && !normalized.roomNumber) issues.push('Room relationship is missing')
  return { sourceKey, index, raw: item, normalized, issues }
}

export function collectLegacyCandidates(legacyExport) {
  const result = {
    guests: [],
    rooms: [],
    reservations: [],
    deferredKeys: [],
    ignoredKeys: [],
    warnings: [],
  }

  for (const entry of legacyExport.entries) {
    const category = keyCategory(entry.key)
    const items = arraysFromEntry(entry)

    if (category === 'deferred') {
      result.deferredKeys.push({ key: entry.key, itemCount: items.length, reason: 'Deferred to a later backend phase. No payment or transaction is imported as verified data.' })
      continue
    }

    if (!items.length) {
      result.ignoredKeys.push({ key: entry.key, reason: 'No array records were found.' })
      continue
    }

    let resolvedCategory = category
    if (resolvedCategory === 'unknown') {
      const inferred = new Set(items.map(inferCategoryFromItem).filter((value) => value !== 'unknown'))
      if (inferred.size === 1) resolvedCategory = [...inferred][0]
    }

    if (resolvedCategory === 'guest') {
      items.forEach((item, index) => result.guests.push(normalizeGuest(item, entry.key, index)))
    } else if (resolvedCategory === 'room') {
      items.forEach((item, index) => result.rooms.push(normalizeRoom(item, entry.key, index)))
    } else if (resolvedCategory === 'reservation') {
      items.forEach((item, index) => result.reservations.push(normalizeReservation(item, entry.key, index)))
    } else {
      result.ignoredKeys.push({ key: entry.key, reason: 'The records do not match Phase 7 guest, room, or reservation data.' })
    }
  }

  if (result.guests.length === 0) result.warnings.push('No legacy guest array was detected. Existing SQLite guests remain unchanged.')
  if (result.rooms.length === 0) result.warnings.push('No legacy room array was detected. Existing SQLite rooms remain unchanged.')
  if (result.reservations.length === 0) result.warnings.push('No legacy reservation array was detected. Existing SQLite reservations remain unchanged.')

  return result
}

export function buildReviewSummary(candidates) {
  const invalid = [
    ...candidates.guests,
    ...candidates.rooms,
    ...candidates.reservations,
  ].filter((candidate) => candidate.issues.length > 0)

  return {
    guests: { total: candidates.guests.length, invalid: candidates.guests.filter((x) => x.issues.length).length },
    rooms: { total: candidates.rooms.length, invalid: candidates.rooms.filter((x) => x.issues.length).length },
    reservations: { total: candidates.reservations.length, invalid: candidates.reservations.filter((x) => x.issues.length).length },
    deferredKeys: candidates.deferredKeys.length,
    ignoredKeys: candidates.ignoredKeys.length,
    invalidRecords: invalid.length,
  }
}
