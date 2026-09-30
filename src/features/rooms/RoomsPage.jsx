import { useCallback, useEffect, useMemo, useState } from 'react'
import { BedDouble, CheckCircle2, Edit3, Plus, Search, Trash2, Wrench, XCircle } from 'lucide-react'

import { createRoom, deleteRoom, getRoomsSummary, listRooms, updateRoom } from '@/api/rooms'
import { getApiErrorMessage } from '@/api/apiHelpers'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import RoomFormModal from './RoomFormModal'

const PAGE_SIZE = 24
const ROOM_STATUSES = ['Available', 'Occupied', 'Maintenance', 'Out of Service']

const STATUS_META = {
  Available: { className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', icon: CheckCircle2 },
  Occupied: { className: 'bg-red-50 text-red-700 ring-1 ring-red-200', icon: XCircle },
  Maintenance: { className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', icon: Wrench },
  'Out of Service': { className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200', icon: XCircle },
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [meta, setMeta] = useState({ total: 0 })
  const [summary, setSummary] = useState({ total: 0, available: 0, occupied: 0, maintenance: 0, outOfService: 0 })
  const [activeStatus, setActiveStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const debouncedSearch = useDebouncedValue(search, 300)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [result, summaryResult] = await Promise.all([
        listRooms({
          page: 1,
          limit: PAGE_SIZE,
          search: debouncedSearch,
          status: activeStatus === 'All' ? '' : activeStatus,
        }),
        getRoomsSummary(),
      ])
      setRooms(result.data.map(toUiRoom))
      setMeta(result.meta)
      setSummary(summaryResult)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load rooms.'))
    } finally {
      setLoading(false)
    }
  }, [activeStatus, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => ({
    All: summary.total,
    Available: summary.available,
    Occupied: summary.occupied,
    Maintenance: summary.maintenance,
    'Out of Service': summary.outOfService,
  }), [summary])

  function openAddModal() {
    setEditingRoom(null)
    setModalOpen(true)
  }

  function openEditModal(room) {
    setEditingRoom(room)
    setModalOpen(true)
  }

  async function handleSave(values) {
    try {
      const payload = {
        roomNumber: values.roomNumber,
        name: values.name,
        type: values.type,
        rateCentavos: Math.round(Number(values.rate) * 100),
        status: values.status,
      }
      if (editingRoom) {
        await updateRoom(editingRoom.id, { ...payload, version: editingRoom.version })
      } else {
        await createRoom(payload)
      }
      await load()
    } catch (requestError) {
      window.alert(getApiErrorMessage(requestError, 'Unable to save room.'))
      throw requestError
    }
  }

  async function handleDelete(room) {
    if (!window.confirm(`Delete ${room.name}? This action cannot be undone.`)) return
    try {
      await deleteRoom(room.id)
      await load()
    } catch (requestError) {
      window.alert(getApiErrorMessage(requestError, 'Unable to delete room.'))
    }
  }

  async function handleStatusChange(room, status) {
    try {
      await updateRoom(room.id, { version: room.version, status })
      await load()
    } catch (requestError) {
      window.alert(getApiErrorMessage(requestError, 'Unable to update room status.'))
    }
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">Core Data Module</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">Room Management</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0b4f8a]">{meta.total} total</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Rooms now load from the Phase 7 SQLite backend.</p>
          </div>
          <button type="button" onClick={openAddModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#083d6c]">
            <Plus size={17} /> Add Room
          </button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {['All', ...ROOM_STATUSES].map((status) => (
                <button key={status} type="button" onClick={() => setActiveStatus(status)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeStatus === status ? 'bg-[#0b4f8a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {status}{counts[status] !== undefined ? ` ${counts[status]}` : ''}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search room number, name, or type..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0b4f8a] focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
        </section>

        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <BedDouble size={30} className="text-slate-400" />
              <h3 className="mt-3 font-bold text-slate-900">No rooms found</h3>
              <p className="mt-1 text-sm text-slate-500">Change your filter or add a room.</p>
            </div>
          ) : (
            rooms.map((room) => <RoomCard key={room.id} room={room} onEdit={openEditModal} onDelete={handleDelete} onStatusChange={handleStatusChange} />)
          )}
        </section>
      </div>

      {modalOpen && <RoomFormModal room={editingRoom} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  )
}

function RoomCard({ room, onEdit, onDelete, onStatusChange }) {
  const meta = STATUS_META[room.status] || STATUS_META.Available
  const Icon = meta.icon
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 text-[#0b4f8a]">
        <BedDouble size={40} />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Room {room.roomNumber}</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900">{room.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{room.type}</p>
          </div>
          <p className="text-sm font-bold text-slate-900">₱{Number(room.rate).toLocaleString()}<span className="ml-1 text-[11px] font-medium text-slate-400">/ night</span></p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}><Icon size={12} />{room.status}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => onEdit(room)} className="rounded-lg p-2 text-[#0b4f8a] hover:bg-blue-50" aria-label={`Edit ${room.name}`}><Edit3 size={15} /></button>
            <button type="button" onClick={() => onDelete(room)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${room.name}`}><Trash2 size={15} /></button>
          </div>
        </div>

        <label className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          Status
          <select value={room.status} onChange={(event) => onStatusChange(room, event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#0b4f8a]">
            {ROOM_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>
    </article>
  )
}

function toUiRoom(room) {
  return {
    ...room,
    rate: Number(room.rateCentavos || 0) / 100,
  }
}
