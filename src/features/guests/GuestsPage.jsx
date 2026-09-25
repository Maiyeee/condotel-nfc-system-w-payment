import { useMemo, useState } from 'react'
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import Pagination from '@/components/ui/Pagination'
import GuestFormModal from './GuestFormModal'
import GuestDetailDrawer from './GuestDetailDrawer'
import { INITIAL_GUESTS } from './guestsData'

const PAGE_SIZE = 5

export default function GuestsPage() {
  const [guests, setGuests] = useState(INITIAL_GUESTS)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return guests
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q)
    )
  }, [guests, search])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const openAddModal = () => {
    setEditingGuest(null)
    setFormOpen(true)
  }

  const openEditModal = (guest) => {
    setEditingGuest(guest)
    setFormOpen(true)
  }

  const openDetail = (guest) => {
    setSelectedGuest(guest)
    setDrawerOpen(true)
  }

  const handleSave = (data) => {
    if (editingGuest) {
      setGuests((prev) => prev.map((g) => (g.id === editingGuest.id ? { ...g, ...data } : g)))
    } else {
      setGuests((prev) => [
        {
          ...data,
          id: Math.max(0, ...prev.map((g) => g.id)) + 1,
          createdAt: new Date().toISOString().slice(0, 10),
          reservations: [],
        },
        ...prev,
      ])
      setPage(1)
    }
  }

  const handleDelete = (guest) => {
    if (!window.confirm(`Remove ${guest.name} from guests?`)) return
    setGuests((prev) => prev.filter((g) => g.id !== guest.id))
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Guest Management</h2>
          <p className="text-sm text-slate-500">{filtered.length} guests</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Guest
        </Button>
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <span className="relative flex max-w-sm items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          />
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-t border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((guest) => (
              <tr key={guest.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <button
                    onClick={() => openDetail(guest)}
                    className="font-medium text-slate-800 hover:text-navy-700 hover:underline"
                  >
                    {guest.name}
                  </button>
                </td>
                <td className="px-5 py-3 text-slate-600">{guest.email}</td>
                <td className="px-5 py-3 text-slate-600">{guest.phone}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={guest.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openDetail(guest)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(guest)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Edit guest"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(guest)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                      title="Remove guest"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                  No guests match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />

      <GuestFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        guest={editingGuest}
      />

      <GuestDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} guest={selectedGuest} />
    </div>
  )
}
