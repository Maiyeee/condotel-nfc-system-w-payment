import { db } from '../db/database.js'

function signedLineTotal(row) {
  const unsigned = row.amount_centavos * row.quantity
  return row.charge_type === 'Discount' ? -unsigned : unsigned
}

function mapCharge(row) {
  if (!row) return null

  return {
    id: row.id,
    reservationId: row.reservation_id,
    description: row.description,
    amountCentavos: row.amount_centavos,
    quantity: row.quantity,
    chargeType: row.charge_type,
    source: row.source,
    version: row.version,
    lineTotalCentavos: signedLineTotal(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at
  }
}

export function listChargesForReservation(reservationId) {
  return db.prepare(`
    SELECT *
    FROM reservation_charges
    WHERE reservation_id = ?
    ORDER BY
      CASE WHEN source = 'room_rate' THEN 0 ELSE 1 END,
      created_at ASC,
      id ASC
  `).all(reservationId).map(mapCharge)
}

export function getChargeById(id) {
  return mapCharge(
    db.prepare('SELECT * FROM reservation_charges WHERE id = ?').get(id)
  )
}

export function getChargeSummaryForReservation(reservationId) {
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(
        CASE
          WHEN charge_type <> 'Discount' THEN amount_centavos * quantity
          ELSE 0
        END
      ), 0) AS positive_total,
      COALESCE(SUM(
        CASE
          WHEN charge_type = 'Discount' THEN amount_centavos * quantity
          ELSE 0
        END
      ), 0) AS discount_total,
      COUNT(*) AS line_count
    FROM reservation_charges
    WHERE reservation_id = ?
  `).get(reservationId)

  const positiveTotal = Number(row.positive_total || 0)
  const discountTotal = Number(row.discount_total || 0)

  return {
    positiveChargesCentavos: positiveTotal,
    discountsCentavos: discountTotal,
    totalCentavos: positiveTotal - discountTotal,
    lineCount: Number(row.line_count || 0)
  }
}

export function insertCharge(charge) {
  db.prepare(`
    INSERT INTO reservation_charges
      (
        id, reservation_id, description, amount_centavos, quantity,
        charge_type, source, version, updated_at
      )
    VALUES
      (
        @id, @reservationId, @description, @amountCentavos, @quantity,
        @chargeType, @source, 1,
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      )
  `).run(charge)

  return getChargeById(charge.id)
}

export function getRoomRateCharge(reservationId) {
  return mapCharge(db.prepare(`
    SELECT *
    FROM reservation_charges
    WHERE reservation_id = ? AND source = 'room_rate'
    LIMIT 1
  `).get(reservationId))
}

export function upsertRoomRateCharge({
  id,
  reservationId,
  description,
  amountCentavos,
  quantity
}) {
  const existing = db.prepare(`
    SELECT id
    FROM reservation_charges
    WHERE reservation_id = ? AND source = 'room_rate'
    LIMIT 1
  `).get(reservationId)

  if (existing) {
    db.prepare(`
      UPDATE reservation_charges
      SET
        description = @description,
        amount_centavos = @amountCentavos,
        quantity = @quantity,
        charge_type = 'Room',
        version = version + 1,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = @existingId
    `).run({
      existingId: existing.id,
      description,
      amountCentavos,
      quantity
    })

    return getChargeById(existing.id)
  }

  return insertCharge({
    id,
    reservationId,
    description,
    amountCentavos,
    quantity,
    chargeType: 'Room',
    source: 'room_rate'
  })
}

export function updateChargeWithVersion(id, version, values) {
  const fieldMap = {
    description: 'description',
    amountCentavos: 'amount_centavos',
    quantity: 'quantity',
    chargeType: 'charge_type'
  }

  const entries = Object.entries(values).filter(
    ([key, value]) => key in fieldMap && value !== undefined
  )

  if (entries.length === 0) return { changes: 0 }

  const assignments = entries.map(([key]) => `${fieldMap[key]} = @${key}`)

  return db.prepare(`
    UPDATE reservation_charges
    SET
      ${assignments.join(', ')},
      version = version + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = @id AND version = @version
  `).run({ id, version, ...values })
}

export function deleteCharge(id) {
  return db.prepare('DELETE FROM reservation_charges WHERE id = ?').run(id)
}
