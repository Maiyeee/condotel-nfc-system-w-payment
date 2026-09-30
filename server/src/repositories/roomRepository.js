import { db } from '../db/database.js'

const ACTIVE_RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Checked-in']

function mapReservation(row) {
  return {
    id: row.id,
    referenceNo: row.reference_no,
    guestId: row.guest_id,
    guestName: row.guest_name,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status,
    createdAt: row.created_at
  }
}

function mapRoom(row, reservations = undefined) {
  if (!row) return null

  const room = {
    id: row.id,
    roomNumber: row.room_number,
    name: row.name,
    type: row.type,
    rateCentavos: row.rate_centavos,
    status: row.status,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }

  if (reservations !== undefined) room.reservations = reservations
  return room
}

function buildRoomWhere({ search, status, type }) {
  const where = []
  const params = {}

  if (search) {
    where.push(`
      (
        lower(room_number) LIKE lower(@search)
        OR lower(name) LIKE lower(@search)
        OR lower(type) LIKE lower(@search)
      )
    `)
    params.search = `%${search}%`
  }

  if (status) {
    where.push('status = @status')
    params.status = status
  }

  if (type) {
    where.push('lower(type) = lower(@type)')
    params.type = type
  }

  return {
    clause: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params
  }
}

export function listRooms({ page, limit, search, status, type }) {
  const { clause, params } = buildRoomWhere({ search, status, type })
  const offset = (page - 1) * limit

  const rows = db.prepare(`
    SELECT *
    FROM rooms
    ${clause}
    ORDER BY room_number COLLATE NOCASE ASC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset })

  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM rooms ${clause}`)
    .get(params).count

  return { data: rows.map((row) => mapRoom(row)), total }
}

export function getRoomById(id) {
  return mapRoom(db.prepare('SELECT * FROM rooms WHERE id = ?').get(id))
}

export function getRoomWithReservations(id) {
  const roomRow = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id)
  if (!roomRow) return null

  const reservations = db.prepare(`
    SELECT
      r.id,
      r.reference_no,
      r.guest_id,
      r.check_in,
      r.check_out,
      r.status,
      r.created_at,
      g.name AS guest_name
    FROM reservations r
    JOIN guests g ON g.id = r.guest_id
    WHERE r.room_id = ?
    ORDER BY r.check_in DESC, r.created_at DESC
  `).all(id).map(mapReservation)

  return mapRoom(roomRow, reservations)
}

export function findRoomByNumber(roomNumber, excludeId = null) {
  if (!roomNumber) return null

  if (excludeId) {
    return db.prepare(`
      SELECT id, room_number, name
      FROM rooms
      WHERE lower(trim(room_number)) = lower(trim(?))
        AND id <> ?
      LIMIT 1
    `).get(roomNumber, excludeId)
  }

  return db.prepare(`
    SELECT id, room_number, name
    FROM rooms
    WHERE lower(trim(room_number)) = lower(trim(?))
    LIMIT 1
  `).get(roomNumber)
}

export function insertRoom(room) {
  db.prepare(`
    INSERT INTO rooms
      (id, room_number, name, type, rate_centavos, status)
    VALUES
      (@id, @roomNumber, @name, @type, @rateCentavos, @status)
  `).run(room)

  return getRoomWithReservations(room.id)
}

export function updateRoomWithVersion(id, version, values) {
  const fieldMap = {
    roomNumber: 'room_number',
    name: 'name',
    type: 'type',
    rateCentavos: 'rate_centavos',
    status: 'status'
  }

  const entries = Object.entries(values).filter(
    ([key, value]) => key in fieldMap && value !== undefined
  )
  const assignments = entries.map(([key]) => `${fieldMap[key]} = @${key}`)

  if (assignments.length === 0) {
    return { changes: 0, room: getRoomWithReservations(id) }
  }

  const result = db.prepare(`
    UPDATE rooms
    SET
      ${assignments.join(', ')},
      version = version + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id AND version = @version
  `).run({ id, version, ...values })

  return {
    changes: result.changes,
    room: result.changes ? getRoomWithReservations(id) : null
  }
}

export function countReservationsForRoom(id) {
  return db.prepare(`
    SELECT COUNT(*) AS count
    FROM reservations
    WHERE room_id = ?
  `).get(id).count
}

export function deleteRoom(id) {
  return db.prepare('DELETE FROM rooms WHERE id = ?').run(id)
}

export function listAvailableRoomsForStay({ checkIn, checkOut, type }) {
  const placeholders = ACTIVE_RESERVATION_STATUSES.map(() => '?').join(', ')
  const params = [...ACTIVE_RESERVATION_STATUSES, checkOut, checkIn]
  let typeFilter = ''

  if (type) {
    typeFilter = 'AND lower(rm.type) = lower(?)'
    params.push(type)
  }

  const rows = db.prepare(`
    SELECT rm.*
    FROM rooms rm
    WHERE rm.status NOT IN ('Maintenance', 'Out of Service')
      ${typeFilter}
      AND NOT EXISTS (
        SELECT 1
        FROM reservations r
        WHERE r.room_id = rm.id
          AND r.status IN (${placeholders})
          AND r.check_in < ?
          AND r.check_out > ?
      )
    ORDER BY rm.room_number COLLATE NOCASE ASC
  `).all(...params)

  return rows.map((row) => mapRoom(row))
}

export function getRoomSummary() {
  const totals = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied,
      SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance,
      SUM(CASE WHEN status = 'Out of Service' THEN 1 ELSE 0 END) AS out_of_service
    FROM rooms
  `).get()

  const byType = db.prepare(`
    SELECT
      type,
      COUNT(*) AS room_count,
      MIN(rate_centavos) AS minimum_rate_centavos,
      MAX(rate_centavos) AS maximum_rate_centavos
    FROM rooms
    GROUP BY type
    ORDER BY type COLLATE NOCASE ASC
  `).all()

  return {
    total: totals.total,
    available: totals.available || 0,
    occupied: totals.occupied || 0,
    maintenance: totals.maintenance || 0,
    outOfService: totals.out_of_service || 0,
    byType: byType.map((row) => ({
      type: row.type,
      roomCount: row.room_count,
      minimumRateCentavos: row.minimum_rate_centavos,
      maximumRateCentavos: row.maximum_rate_centavos
    }))
  }
}
