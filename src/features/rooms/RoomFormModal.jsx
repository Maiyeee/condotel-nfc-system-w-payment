import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X } from 'lucide-react'

const ROOM_STATUSES = ['Available', 'Occupied', 'Maintenance', 'Out of Service']
const ROOM_TYPES = ['Deluxe Room', 'Superior Room', 'Suite', 'Studio', 'Family Room']

const schema = z.object({
  roomNumber: z.string().trim().min(1, 'Room number is required.'),
  name: z.string().trim().min(1, 'Room name is required.'),
  type: z.string().trim().min(1, 'Room type is required.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  status: z.enum(ROOM_STATUSES),
})

const EMPTY_VALUES = {
  roomNumber: '',
  name: '',
  type: 'Deluxe Room',
  rate: 2500,
  status: 'Available',
}

export default function RoomFormModal({ room, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    reset(
      room
        ? {
            roomNumber: room.roomNumber,
            name: room.name,
            type: room.type,
            rate: room.rate,
            status: room.status,
          }
        : EMPTY_VALUES
    )
  }, [room, reset])

  async function submit(values) {
    await onSave({
      ...values,
      rate: Number(values.rate),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{room ? 'Edit Room' : 'Add Room'}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Saved directly to the Phase 7 SQLite backend.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room Number" error={errors.roomNumber?.message}>
              <input {...register('roomNumber')} placeholder="101" className="form-input" />
            </Field>
            <Field label="Room Name" error={errors.name?.message}>
              <input {...register('name')} placeholder="Room 101" className="form-input" />
            </Field>
            <Field label="Room Type" error={errors.type?.message}>
              <select {...register('type')} className="form-input">
                {ROOM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Nightly Rate (₱)" error={errors.rate?.message}>
              <input {...register('rate')} type="number" min="0" step="50" className="form-input" />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <select {...register('status')} className="form-input">
                {ROOM_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {isSubmitting ? 'Saving...' : room ? 'Save Changes' : 'Add Room'}
            </button>
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
