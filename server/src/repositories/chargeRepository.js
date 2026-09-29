import { db } from '../db/database.js'

function mapCharge(row) {
  if (!row) return null
  return {
    id: row.id,
    reservationId: row.reservation_id,
    description: row.description,
    amountCentavos: row.amount_centavos,
    quantity: row.quantity,
    lineTotalCentavos: row.amount_centavos * row.quantity,
    createdAt: row.created_at
  }
}

export function listChargesForReservation(reservationId) {
  return db.prepare(`
    SELECT *
    FROM reservation_charges
    WHERE reservation_id = ?
    ORDER BY created_at ASC
  `).all(reservationId).map(mapCharge)
}

export function getChargeById(id) {
  return mapCharge(
    db.prepare('SELECT * FROM reservation_charges WHERE id = ?').get(id)
  )
}

export function insertCharge(charge) {
  db.prepare(`
    INSERT INTO reservation_charges
      (id, reservation_id, description, amount_centavos, quantity)
    VALUES
      (@id, @reservationId, @description, @amountCentavos, @quantity)
  `).run(charge)

  return getChargeById(charge.id)
}
