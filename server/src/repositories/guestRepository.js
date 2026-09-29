import { db } from '../db/database.js'

function mapGuest(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    status: row.status,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
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
    FROM guests
    ${clause}
    ORDER BY created_at DESC, name ASC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset })

  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM guests ${clause}`)
    .get(params).count

  return { data: rows.map(mapGuest), total }
}

export function getGuestById(id) {
  return mapGuest(db.prepare('SELECT * FROM guests WHERE id = ?').get(id))
}

export function insertGuest(guest) {
  db.prepare(`
    INSERT INTO guests
      (id, name, email, phone, address, status)
    VALUES
      (@id, @name, @email, @phone, @address, @status)
  `).run(guest)

  return getGuestById(guest.id)
}

export function updateGuest(id, values) {
  const fieldMap = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    status: 'status'
  }

  const entries = Object.entries(values).filter(([key]) => key in fieldMap)
  const assignments = entries.map(([key]) => `${fieldMap[key]} = @${key}`)

  if (assignments.length === 0) return getGuestById(id)

  db.prepare(`
    UPDATE guests
    SET
      ${assignments.join(', ')},
      version = version + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id
  `).run({ id, ...values })

  return getGuestById(id)
}

export function deleteGuest(id) {
  return db.prepare('DELETE FROM guests WHERE id = ?').run(id)
}
