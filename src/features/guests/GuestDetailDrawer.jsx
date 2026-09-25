import { Mail, Phone, IdCard, CalendarDays } from 'lucide-react'
import Drawer from '@/components/ui/Drawer'
import StatusBadge from '@/components/ui/StatusBadge'

export default function GuestDetailDrawer({ open, onClose, guest }) {
  if (!guest) return null

  return (
    <Drawer open={open} onClose={onClose} title="Guest Details">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-900 text-base font-semibold text-white">
          {guest.name?.[0] ?? '?'}
        </div>
        <div>
          <div className="text-base font-semibold text-slate-800">{guest.name}</div>
          <StatusBadge status={guest.status} />
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>{guest.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="h-4 w-4 text-slate-400" />
          <span>{guest.phone}</span>
        </div>
        {guest.idNumber && (
          <div className="flex items-center gap-2 text-slate-600">
            <IdCard className="h-4 w-4 text-slate-400" />
            <span>{guest.idNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-slate-600">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span>Guest since {guest.createdAt}</span>
        </div>
      </dl>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-semibold text-slate-700">Reservation History</h4>
        {guest.reservations?.length ? (
          <ul className="space-y-2">
            {guest.reservations.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{r.room}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {r.checkIn} → {r.checkOut} · {r.id}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No reservations yet.</p>
        )}
      </div>
    </Drawer>
  )
}
