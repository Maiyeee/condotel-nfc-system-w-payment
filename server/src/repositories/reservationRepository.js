import { db } from '../db/database.js'

export const ACTIVE_RESERVATION_STATUSES = [
  'Pending',
  'Confirmed',
  'Checked-in'
]

function mapReservation(row) {
  if (!row) return null

  return {
    id: row.id,
    referenceNo: row.reference_no,
    guestId: row.guest_id,
    roomId: row.room_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status,
    notes: row.notes,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    guest: row.guest_name
      ? { id: row.guest_id, name: row.guest_name, email: row.guest_email }
      : undefined,
    room: row.room_number
      ? {
          id: row.room_id,
          roomNumber: row.room_number,
          name: row.room_name,
          type: row.room_type
        }
      : undefined
  }
}

const baseSelect = `
  SELECT
    r.*,
    g.name AS guest_name,
    g.email AS guest_email,
    rm.room_number AS room_number,
    rm.name AS room_name,
    rm.type AS room_type
  FROM reservations r
  JOIN guests g ON g.id = r.guest_id
  JOIN rooms rm ON rm.id = r.room_id
`

export function listReservations({
  page,
  limit,
  search,
  status,
  guestId,
  roomId
}) {
  const where = []
  const params = {}

  if (search) {
    where.push(`
      (
        lower(r.reference_no) LIKE lower(@search)
        OR lower(g.name) LIKE lower(@search)
        OR lower(g.email) LIKE lower(@search)
        OR lower(rm.room_number) LIKE lower(@search)
        OR lower(rm.name) LIKE lower(@search)
      )
    `)
    params.search = `%${search}%`
  }

  if (status) {
    where.push('r.status = @status')
    params.status = status
  }

  if (guestId) {
    where.push('r.guest_id = @guestId')
    params.guestId = guestId
  }

  if (roomId) {
    where.push('r.room_id = @roomId')
    params.roomId = roomId
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  const rows = db.prepare(`
    ${baseSelect}
    ${clause}
    ORDER BY r.check_in ASC, r.created_at DESC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset })

  const total = db.prepare(`
    SELECT COUNT(*) AS count
    FROM reservations r
    JOIN guests g ON g.id = r.guest_id
    JOIN rooms rm ON rm.id = r.room_id
    ${clause}
  `).get(params).count

  return { data: rows.map(mapReservation), total }
}

export function getReservationById(id) {
  return mapReservation(db.prepare(`${baseSelect} WHERE r.id = ?`).get(id))
}

export function findOverlap({ roomId, checkIn, checkOut, excludeId = null }) {
  const placeholders = ACTIVE_RESERVATION_STATUSES.map(() => '?').join(', ')
  const values = [roomId, ...ACTIVE_RESERVATION_STATUSES, checkOut, checkIn]
  let exclude = ''

  if (excludeId) {
    exclude = 'AND id <> ?'
    values.push(excludeId)
  }

  return db.prepare(`
    SELECT id, reference_no, check_in, check_out, status
    FROM reservations
    WHERE room_id = ?
      AND status IN (${placeholders})
      AND check_in < ?
      AND check_out > ?
      ${exclude}
    LIMIT 1
  `).get(...values)
}

export function insertReservation(record) {
  db.prepare(`
    INSERT INTO reservations
      (id, reference_no, guest_id, room_id, check_in, check_out, status, notes)
    VALUES
      (@id, @referenceNo, @guestId, @roomId, @checkIn, @checkOut, @status, @notes)
  `).run(record)

  return getReservationById(record.id)
}

export function updateReservationWithVersion(id, version, values) {
  const fieldMap = {
    guestId: 'guest_id',
    roomId: 'room_id',
    checkIn: 'check_in',
    checkOut: 'check_out',
    status: 'status',
    notes: 'notes'
  }

  const entries = Object.entries(values).filter(([key]) => key in fieldMap)
  const assignments = entries.map(([key]) => `${fieldMap[key]} = @${key}`)

  return db.prepare(`
    UPDATE reservations
    SET
      ${assignments.join(', ')},
      version = version + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id AND version = @version
  `).run({ id, version, ...values })
}

export function deleteReservation(id) {
  return db.prepare('DELETE FROM reservations WHERE id = ?').run(id)
}
