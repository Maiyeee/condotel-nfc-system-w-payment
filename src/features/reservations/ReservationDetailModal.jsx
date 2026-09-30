import { useEffect, useState } from 'react'
import { CalendarDays, UserRound, X } from 'lucide-react'

import { listReservationCharges } from '@/api/charges'
import { getApiErrorMessage } from '@/api/apiHelpers'

const STATUS_CLASSES = {
  Pending: 'bg-amber-50 text-amber-700',
  Confirmed: 'bg-blue-50 text-blue-700',
  'Checked-in': 'bg-emerald-50 text-emerald-700',
  'Checked-out': 'bg-slate-100 text-slate-600',
  Cancelled: 'bg-red-50 text-red-700',
}

export default function ReservationDetailModal({ reservation, guest, room, onClose, onEdit }) {
  const [charges, setCharges] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reservation?.id) return
    let active = true
    listReservationCharges(reservation.id)
      .then((result) => {
        if (!active) return
        setCharges(result.data || [])
        setSummary(result.summary || null)
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, 'Unable to load charges.'))
      })
    return () => { active = false }
  }, [reservation?.id])

  if (!reservation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">Reservation Details</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{reservation.referenceNo}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={19} /></button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div><p className="text-xs text-slate-400">Status</p><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[reservation.status] || STATUS_CLASSES.Pending}`}>{reservation.status}</span></div>
            <div className="text-right"><p className="text-xs text-slate-400">Room</p><p className="mt-1 text-sm font-bold text-slate-800">{room?.name || reservation.room?.name || reservation.roomId}</p></div>
          </div>

          <DetailRow icon={UserRound} label="Guest" value={guest?.name || reservation.guest?.name || reservation.guestId} />
          <DetailRow icon={CalendarDays} label="Stay" value={`${formatDate(reservation.checkIn)} to ${formatDate(reservation.checkOut)}`} />

          <div className="grid grid-cols-2 gap-3">
            <Info label="Room Type" value={room?.type || reservation.room?.type || '—'} />
            <Info label="Nightly Rate" value={`₱${Number((room?.rateCentavos || reservation.room?.rateCentavos || 0) / 100).toLocaleString()}`} />
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-800">Charges</h3>
              <span className="text-sm font-bold text-[#0b4f8a]">₱{Number((summary?.totalCentavos || reservation.totalChargesCentavos || 0) / 100).toLocaleString()}</span>
            </div>
            {error ? <p className="px-4 py-3 text-xs text-red-600">{error}</p> : charges.length === 0 ? <p className="px-4 py-3 text-xs text-slate-500">No charge lines found.</p> : (
              <div className="divide-y divide-slate-100">
                {charges.map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div><p className="font-medium text-slate-700">{charge.description}</p><p className="text-xs text-slate-400">{charge.chargeType} · Qty {charge.quantity}</p></div>
                    <span className={charge.lineTotalCentavos < 0 ? 'font-semibold text-red-600' : 'font-semibold text-slate-800'}>{charge.lineTotalCentavos < 0 ? '-' : ''}₱{Math.abs(charge.lineTotalCentavos / 100).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
          <button type="button" onClick={() => onEdit(reservation)} className="rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white">Edit Reservation</button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><Icon size={17} className="text-slate-400" /><div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-medium text-slate-700">{value}</p></div></div>
}

function Info({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value}</p></div>
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`))
}
