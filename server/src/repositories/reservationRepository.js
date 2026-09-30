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
    chargeCount: Number(row.charge_count || 0),
    totalChargesCentavos: Number(row.total_charges_centavos || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    guest: row.guest_name
      ? {
          id: row.guest_id,
          name: row.guest_name,
          email: row.guest_email,
          phone: row.guest_phone
        }
      : undefined,
    room: row.room_number
      ? {
          id: row.room_id,
          roomNumber: row.room_number,
          name: row.room_name,
          type: row.room_type,
          rateCentavos: row.room_rate_centavos
        }
      : undefined
  }
}

const baseSelect = `
  SELECT
    r.*,
    g.name AS guest_name,
    g.email AS guest_email,
    g.phone AS guest_phone,
    rm.room_number AS room_number,
    rm.name AS room_name,
    rm.type AS room_type,
    rm.rate_centavos AS room_rate_centavos,
    (
      SELECT COUNT(*)
      FROM reservation_charges c
      WHERE c.reservation_id = r.id
    ) AS charge_count,
    (
      SELECT COALESCE(SUM(
        CASE
          WHEN c.charge_type = 'Discount'
            THEN -(c.amount_centavos * c.quantity)
          ELSE c.amount_centavos * c.quantity
        END
      ), 0)
      FROM reservation_charges c
      WHERE c.reservation_id = r.id
    ) AS total_charges_centavos
  FROM reservations r
  JOIN guests g ON g.id = r.guest_id
  JOIN rooms rm ON rm.id = r.room_id
`

function buildWhere({ search, status, guestId, roomId, from, to }) {
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

  if (from && to) {
    where.push('r.check_in < @to AND r.check_out > @from')
    params.from = from
    params.to = to
  } else if (from) {
    where.push('r.check_out > @from')
    params.from = from
  } else if (to) {
    where.push('r.check_in < @to')
    params.to = to
  }

  return {
    clause: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params
  }
}

export function listReservations(query) {
  const { page, limit } = query
  const { clause, params } = buildWhere(query)
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

export function getReservationSummary() {
  const statuses = db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM reservations
    GROUP BY status
  `).all()

  const totals = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(
        CASE
          WHEN status IN ('Pending', 'Confirmed', 'Checked-in') THEN 1
          ELSE 0
        END
      ), 0) AS active
    FROM reservations
  `).get()

  const byStatus = Object.fromEntries(
    statuses.map((row) => [row.status, Number(row.count)])
  )

  return {
    total: Number(totals.total || 0),
    active: Number(totals.active || 0),
    byStatus
  }
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

  const entries = Object.entries(values).filter(
    ([key, value]) => key in fieldMap && value !== undefined
  )
  const assignments = entries.map(([key]) => `${fieldMap[key]} = @${key}`)

  if (assignments.length === 0) return { changes: 0 }

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
