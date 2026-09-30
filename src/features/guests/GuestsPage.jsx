import { useCallback, useEffect, useState } from 'react'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'

import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import StatusBadge from '@/components/ui/StatusBadge'
import { createGuest, deleteGuest, listGuests, updateGuest } from '@/api/guests'
import { getApiErrorMessage } from '@/api/apiHelpers'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import GuestDetailDrawer from './GuestDetailDrawer'
import GuestFormModal from './GuestFormModal'

const PAGE_SIZE = 5

export default function GuestsPage() {
  const [guests, setGuests] = useState([])
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const debouncedSearch = useDebouncedValue(search, 300)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listGuests({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      })
      setGuests(result.data)
      setMeta(result.meta)
      if (page > result.meta.totalPages && result.meta.totalPages > 0) {
        setPage(result.meta.totalPages)
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load guests.'))
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  function openAddModal() {
    setEditingGuest(null)
    setFormOpen(true)
  }

  function openEditModal(guest) {
    setEditingGuest(guest)
    setFormOpen(true)
  }

  function openDetail(guest) {
    setSelectedGuest(guest)
    setDrawerOpen(true)
  }

  async function handleSave(values) {
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, {
          ...values,
          version: editingGuest.version,
        })
      } else {
        await createGuest(values)
        setPage(1)
      }
      await load()
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to save guest.')
      window.alert(message)
      throw requestError
    }
  }

  async function handleDelete(guest) {
    if (!window.confirm(`Remove ${guest.name} from guests?`)) return
    try {
      await deleteGuest(guest.id)
      if (selectedGuest?.id === guest.id) {
        setSelectedGuest(null)
        setDrawerOpen(false)
      }
      await load()
    } catch (requestError) {
      window.alert(getApiErrorMessage(requestError, 'Unable to delete guest.'))
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Guest Management</h2>
          <p className="text-sm text-slate-500">{meta.total} guests</p>
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone, or ID..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          />
        </span>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                  Loading guests...
                </td>
              </tr>
            ) : guests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                  No guests found.
                </td>
              </tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{guest.name}</td>
                  <td className="px-5 py-3 text-slate-600">{guest.email || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{guest.phone}</td>
                  <td className="px-5 py-3"><StatusBadge status={guest.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openDetail(guest)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`View ${guest.name}`}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openEditModal(guest)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Edit ${guest.name}`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(guest)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${guest.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={meta.total} onPageChange={setPage} />

      <GuestFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        guest={editingGuest}
      />
      <GuestDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        guest={selectedGuest}
      />
    </div>
  )
}
