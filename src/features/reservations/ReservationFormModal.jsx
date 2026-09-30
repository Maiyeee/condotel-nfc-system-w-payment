import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X } from 'lucide-react'

const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled']

const schema = z.object({
  guestId: z.string().min(1, 'Guest is required.'),
  roomId: z.string().min(1, 'Room is required.'),
  checkIn: z.string().min(1, 'Check-in date is required.'),
  checkOut: z.string().min(1, 'Check-out date is required.'),
  status: z.enum(RESERVATION_STATUSES),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less.').optional(),
}).refine((value) => value.checkOut > value.checkIn, {
  path: ['checkOut'],
  message: 'Check-out must be after check-in.',
})

const EMPTY_VALUES = {
  guestId: '',
  roomId: '',
  checkIn: '',
  checkOut: '',
  status: 'Pending',
  notes: '',
}

export default function ReservationFormModal({ reservation, guests, rooms, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES })

  useEffect(() => {
    reset(
      reservation
        ? {
            guestId: reservation.guestId,
            roomId: reservation.roomId,
            checkIn: reservation.checkIn,
            checkOut: reservation.checkOut,
            status: reservation.status,
            notes: reservation.notes || '',
          }
        : EMPTY_VALUES
    )
  }, [reservation, reset])

  async function submit(values) {
    await onSave(values)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{reservation ? 'Edit Reservation' : 'New Reservation'}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Availability and overlap rules are validated by the backend.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={19} /></button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Guest" error={errors.guestId?.message}>
              <select {...register('guestId')} className="form-input">
                <option value="">Select guest</option>
                {guests.map((guest) => <option key={guest.id} value={guest.id}>{guest.name}</option>)}
              </select>
            </Field>
            <Field label="Room" error={errors.roomId?.message}>
              <select {...register('roomId')} className="form-input">
                <option value="">Select room</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.type}</option>)}
              </select>
            </Field>
            <Field label="Check-in" error={errors.checkIn?.message}><input {...register('checkIn')} type="date" className="form-input" /></Field>
            <Field label="Check-out" error={errors.checkOut?.message}><input {...register('checkOut')} type="date" className="form-input" /></Field>
            <Field label="Status" error={errors.status?.message}>
              <select {...register('status')} className="form-input">{RESERVATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            </Field>
          </div>
          <Field label="Notes" error={errors.notes?.message}><textarea {...register('notes')} rows="3" className="form-input" placeholder="Optional reservation notes" /></Field>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? 'Saving...' : reservation ? 'Save Changes' : 'Create Reservation'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
