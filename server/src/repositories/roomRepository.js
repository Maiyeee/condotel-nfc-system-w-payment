import { db } from '../db/database.js'

function mapRoom(row) {
  if (!row) return null
  return {
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
}

export function listRooms({ page, limit, search, status }) {
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

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const offset = (page - 1) * limit

  const rows = db.prepare(`
    SELECT *
    FROM rooms
    ${clause}
    ORDER BY room_number ASC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset })

  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM rooms ${clause}`)
    .get(params).count

  return { data: rows.map(mapRoom), total }
}

export function getRoomById(id) {
  return mapRoom(db.prepare('SELECT * FROM rooms WHERE id = ?').get(id))
}

export function insertRoom(room) {
  db.prepare(`
    INSERT INTO rooms
      (id, room_number, name, type, rate_centavos, status)
    VALUES
      (@id, @roomNumber, @name, @type, @rateCentavos, @status)
  `).run(room)

  return getRoomById(room.id)
}

export function updateRoom(id, values) {
  const fieldMap = {
    roomNumber: 'room_number',
    name: 'name',
    type: 'type',
    rateCentavos: 'rate_centavos',
    status: 'status'
  }

  const entries = Object.entries(values).filter(([key]) => key in fieldMap)
  const assignments = entries.map(([key]) => `${fieldMap[key]} = @${key}`)

  if (assignments.length === 0) return getRoomById(id)

  db.prepare(`
    UPDATE rooms
    SET
      ${assignments.join(', ')},
      version = version + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id
  `).run({ id, ...values })

  return getRoomById(id)
}
