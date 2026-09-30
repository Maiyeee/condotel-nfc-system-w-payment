import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react'

import { listGuests } from '@/api/guests'
import { listRooms } from '@/api/rooms'
import { createReservation, deleteReservation, listReservations, updateReservation } from '@/api/reservations'
import { getApiErrorMessage } from '@/api/apiHelpers'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import ReservationDetailModal from './ReservationDetailModal'
import ReservationFormModal from './ReservationFormModal'

const PAGE_SIZE = 5
const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled']
const STATUS_CLASSES = {
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  'Checked-in': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'Checked-out': 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  Cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [guests, setGuests] = useState([])
  const [rooms, setRooms] = useState([])
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [activeStatus, setActiveStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [detailReservation, setDetailReservation] = useState(null)
  const [menuId, setMenuId] = useState(null)
  const debouncedSearch = useDebouncedValue(search, 300)

  const loadReservationsData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listReservations({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: activeStatus === 'All' ? '' : activeStatus,
      })
      setReservations(result.data)
      setMeta(result.meta)
      if (page > result.meta.totalPages && result.meta.totalPages > 0) setPage(result.meta.totalPages)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load reservations.'))
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, activeStatus])

  const loadLookups = useCallback(async () => {
    try {
      const [guestResult, roomResult] = await Promise.all([
        listGuests({ page: 1, limit: 100 }),
        listRooms({ page: 1, limit: 100 }),
      ])
      setGuests(guestResult.data)
      setRooms(roomResult.data.map((room) => ({ ...room, rate: room.rateCentavos / 100 })))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load reservation lookups.'))
    }
  }, [])

  useEffect(() => { loadReservationsData() }, [loadReservationsData])
  useEffect(() => { loadLookups() }, [loadLookups])
  useEffect(() => { setPage(1) }, [activeStatus, debouncedSearch])

  const guestById = useMemo(() => Object.fromEntries(guests.map((guest) => [guest.id, guest])), [guests])
  const roomById = useMemo(() => Object.fromEntries(rooms.map((room) => [room.id, room])), [rooms])

  function openAddModal() {
    setEditingReservation(null)
    setFormOpen(true)
  }

  function openEditModal(reservation) {
    setMenuId(null)
    setDetailReservation(null)
    setEditingReservation(reservation)
    setFormOpen(true)
  }

  async function handleSave(values) {
    try {
      if (editingReservation) {
        await updateReservation(editingReservation.id, {
          ...values,
          version: editingReservation.version,
        })
      } else {
        await createReservation(values)
        setPage(1)
      }
      await Promise.all([loadReservationsData(), loadLookups()])
    } catch (requestError) {
      window.alert(getApiErrorMessage(requestError, 'Unable to save reservation.'))
      throw requestError
    }
  }

  async function handleDelete(reservation) {
    setMenuId(null)
    if (!window.confirm(`Delete ${reservation.referenceNo}? This action cannot be undone.`)) return
    try {
      await deleteReservation(reservation.id)
      await loadReservationsData()
    } catch (requestError) {
      window.alert(getApiErrorMessage(requestError, 'Unable to delete reservation.'))
    }
  }

  async function updateStatus(reservation, status) {
    setMenuId(null)
    try {
      await updateReservation(reservation.id, { version: reservation.version, status })
      await loadReservationsData()
    } catch (requestError) {
      window.alert(getApiErrorMessage(requestError, 'Unable to update reservation status.'))
    }
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">Core Data Module</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">Reservations</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0b4f8a]">{meta.total} total</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Guest, room, reservation, and charge IDs now come from one backend.</p>
          </div>
          <button type="button" onClick={openAddModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#083d6c]"><Plus size={17} />New Reservation</button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {['All', ...RESERVATION_STATUSES].map((status) => (
                <button key={status} type="button" onClick={() => setActiveStatus(status)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeStatus === status ? 'bg-[#0b4f8a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{status}</button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, guest, or room..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0b4f8a] focus:ring-2 focus:ring-blue-100" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"><X size={15} /></button>}
            </div>
          </div>
        </section>

        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="mt-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead><tr className="border-b border-slate-100 bg-slate-50/70"><HeaderCell>Reference No.</HeaderCell><HeaderCell>Guest Name</HeaderCell><HeaderCell>Room</HeaderCell><HeaderCell>Check-in</HeaderCell><HeaderCell>Check-out</HeaderCell><HeaderCell>Status</HeaderCell><HeaderCell>Charges</HeaderCell><HeaderCell /></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="8" className="px-5 py-10 text-center text-sm text-slate-500">Loading reservations...</td></tr> : reservations.length === 0 ? <tr><td colSpan="8" className="px-5 py-10 text-center text-sm text-slate-500">No reservations found.</td></tr> : reservations.map((reservation) => {
                  const guest = guestById[reservation.guestId] || reservation.guest
                  const room = roomById[reservation.roomId] || reservation.room
                  return (
                    <tr key={reservation.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-sm font-bold text-[#0b4f8a]"><button type="button" onClick={() => setDetailReservation(reservation)}>{reservation.referenceNo}</button></td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-800">{guest?.name || reservation.guestId}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{room?.name || reservation.roomId}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{reservation.checkIn}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{reservation.checkOut}</td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[reservation.status] || STATUS_CLASSES.Pending}`}>{reservation.status}</span></td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">₱{Number((reservation.totalChargesCentavos || 0) / 100).toLocaleString()}</td>
                      <td className="relative px-5 py-4 text-right">
                        <button type="button" onClick={() => setMenuId(menuId === reservation.id ? null : reservation.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={17} /></button>
                        {menuId === reservation.id && <div className="absolute right-5 z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg">
                          <button type="button" onClick={() => openEditModal(reservation)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Edit3 size={14} />Edit</button>
                          {RESERVATION_STATUSES.filter((status) => status !== reservation.status).map((status) => <button key={status} type="button" onClick={() => updateStatus(reservation, status)} className="w-full px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50">Mark {status}</button>)}
                          <button type="button" onClick={() => handleDelete(reservation)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14} />Delete</button>
                        </div>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <span className="text-sm text-slate-500">Page {page} of {Math.max(1, meta.totalPages)}</span>
            <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40">Previous</button><button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40">Next</button></div>
          </div>
        </section>
      </div>

      {formOpen && <ReservationFormModal reservation={editingReservation} guests={guests} rooms={rooms} onClose={() => setFormOpen(false)} onSave={handleSave} />}
      {detailReservation && <ReservationDetailModal reservation={detailReservation} guest={guestById[detailReservation.guestId]} room={roomById[detailReservation.roomId]} onClose={() => setDetailReservation(null)} onEdit={openEditModal} />}
    </div>
  )
}

function HeaderCell({ children }) {
  return <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</th>
}
