import { db } from '../db/database.js'

function toApiStatus(status) {
  return String(status || '').toLowerCase()
}

function toDatabaseStatus(status) {
  if (status === undefined) return undefined
  return status === 'inactive' ? 'Inactive' : 'Active'
}

function mapReservation(row) {
  return {
    id: row.id,
    referenceNo: row.reference_no,
    roomId: row.room_id,
    room: row.room_name || `Room ${row.room_number}`,
    roomNumber: row.room_number,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: String(row.status || '').toLowerCase().replaceAll('-', ' ')
  }
}

function mapGuest(row, reservations = []) {
  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    idNumber: row.id_number || '',
    address: row.address || '',
    status: toApiStatus(row.status),
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reservations
  }
}

function getReservationsForGuestIds(guestIds) {
  if (!guestIds.length) return new Map()

  const placeholders = guestIds.map(() => '?').join(', ')
  const rows = db.prepare(`
    SELECT
      r.id,
      r.reference_no,
      r.guest_id,
      r.room_id,
      r.check_in,
      r.check_out,
      r.status,
      rm.room_number,
      rm.name AS room_name
    FROM reservations r
    JOIN rooms rm ON rm.id = r.room_id
    WHERE r.guest_id IN (${placeholders})
    ORDER BY r.check_in DESC, r.created_at DESC
  `).all(...guestIds)

  const grouped = new Map(guestIds.map((id) => [id, []]))

  for (const row of rows) {
    grouped.get(row.guest_id)?.push(mapReservation(row))
  }

  return grouped
}

export function listGuests({ page, limit, search, status }) {
  const where = []
  const params = {}

  if (search) {
    where.push(`
      (
        lower(name) LIKE lower(@search)
        OR lower(email) LIKE lower(@search)
        OR lower(phone) LIKE lower(@search)
        OR lower(id_number) LIKE lower(@search)
      )
    `)
    params.search = `%${search}%`
  }

  if (status) {
    where.push('status = @status')
    params.status = toDatabaseStatus(status)
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  const rows = db.prepare(`
    SELECT *
    FROM guests
    ${clause}
    ORDER BY created_at DESC, name ASC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset })

  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM guests ${clause}`)
    .get(params).count

  const reservationMap = getReservationsForGuestIds(rows.map((row) => row.id))

  return {
    data: rows.map((row) => mapGuest(row, reservationMap.get(row.id) || [])),
    total
  }
}

export function getGuestById(id) {
  const row = db.prepare('SELECT * FROM guests WHERE id = ?').get(id)
  if (!row) return null

  const reservations = getReservationsForGuestIds([id]).get(id) || []
  return mapGuest(row, reservations)
}

export function findGuestByEmail(email, excludeId = null) {
  if (!email) return null

  if (excludeId) {
    return db.prepare(`
      SELECT id, name, email
      FROM guests
      WHERE lower(email) = lower(?) AND id <> ?
      LIMIT 1
    `).get(email, excludeId)
  }

  return db.prepare(`
    SELECT id, name, email
    FROM guests
    WHERE lower(email) = lower(?)
    LIMIT 1
  `).get(email)
}

export function findGuestByIdNumber(idNumber, excludeId = null) {
  if (!idNumber) return null

  if (excludeId) {
    return db.prepare(`
      SELECT id, name, id_number
      FROM guests
      WHERE upper(id_number) = upper(?) AND id <> ?
      LIMIT 1
    `).get(idNumber, excludeId)
  }

  return db.prepare(`
    SELECT id, name, id_number
    FROM guests
    WHERE upper(id_number) = upper(?)
    LIMIT 1
  `).get(idNumber)
}

export function insertGuest(guest) {
  db.prepare(`
    INSERT INTO guests
      (id, name, email, phone, id_number, address, status)
    VALUES
      (@id, @name, @email, @phone, @idNumber, @address, @status)
  `).run({
    ...guest,
    status: toDatabaseStatus(guest.status)
  })

  return getGuestById(guest.id)
}

export function updateGuestWithVersion(id, version, values) {
  const fieldMap = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    idNumber: 'id_number',
    address: 'address',
    status: 'status'
  }

  const normalized = {
    ...values,
    status: toDatabaseStatus(values.status)
  }

  const entries = Object.entries(normalized).filter(
    ([key, value]) => key in fieldMap && value !== undefined
  )
  const assignments = entries.map(([key]) => `${fieldMap[key]} = @${key}`)

  if (assignments.length === 0) {
    return { changes: 0, guest: getGuestById(id) }
  }

  const result = db.prepare(`
    UPDATE guests
    SET
      ${assignments.join(', ')},
      version = version + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id AND version = @version
  `).run({ id, version, ...normalized })

  return {
    changes: result.changes,
    guest: result.changes ? getGuestById(id) : null
  }
}

export function countReservationsForGuest(id) {
  return db.prepare(`
    SELECT COUNT(*) AS count
    FROM reservations
    WHERE guest_id = ?
  `).get(id).count
}

export function deleteGuest(id) {
  return db.prepare('DELETE FROM guests WHERE id = ?').run(id)
}
