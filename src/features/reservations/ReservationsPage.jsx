import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import ReservationDetailModal from "./ReservationDetailModal";
import ReservationFormModal from "./ReservationFormModal";
import {
  DEFAULT_RESERVATIONS,
  DEMO_GUESTS,
  DEMO_ROOMS,
  RESERVATION_STATUSES,
} from "./reservationData";
import { loadReservations, saveReservations } from "./reservationStorage";

const PAGE_SIZE = 5;

const STATUS_CLASSES = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Checked-in":
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Checked-out": "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState(() =>
    loadReservations(DEFAULT_RESERVATIONS),
  );
  const [guests] = useState(DEMO_GUESTS);
  const [rooms] = useState(DEMO_ROOMS);
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [detailReservation, setDetailReservation] = useState(null);
  const [menuId, setMenuId] = useState(null);

  useEffect(() => {
    saveReservations(reservations);
  }, [reservations]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, search]);

  const guestById = useMemo(
    () => Object.fromEntries(guests.map((guest) => [guest.id, guest])),
    [guests],
  );

  const roomById = useMemo(
    () => Object.fromEntries(rooms.map((room) => [room.id, room])),
    [rooms],
  );

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations
      .filter((reservation) => {
        const statusMatch =
          activeStatus === "All" || reservation.status === activeStatus;

        const guest = guestById[reservation.guestId];
        const room = roomById[reservation.roomId];

        const searchMatch =
          !query ||
          [
            reservation.referenceNo,
            guest?.name,
            guest?.email,
            room?.name,
            reservation.roomId,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);

        return statusMatch && searchMatch;
      })
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }, [reservations, activeStatus, search, guestById, roomById]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReservations.length / PAGE_SIZE),
  );

  const visibleReservations = filteredReservations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const counts = useMemo(
    () => ({
      All: reservations.length,
      ...Object.fromEntries(
        RESERVATION_STATUSES.map((status) => [
          status,
          reservations.filter((item) => item.status === status).length,
        ]),
      ),
    }),
    [reservations],
  );

  function openCreate() {
    setEditingReservation(null);
    setFormOpen(true);
  }

  function openEdit(reservation) {
    setDetailReservation(null);
    setMenuId(null);
    setEditingReservation(reservation);
    setFormOpen(true);
  }

  function handleSave(values) {
    setReservations((current) => {
      if (editingReservation) {
        return current.map((item) =>
          item.id === editingReservation.id
            ? { ...item, ...values, id: editingReservation.id }
            : item,
        );
      }

      return [
        ...current,
        {
          ...values,
          id: `reservation-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ];
    });

    setFormOpen(false);
    setEditingReservation(null);
  }

  function handleDelete(reservation) {
    setMenuId(null);

    const confirmed = window.confirm(
      `Delete ${reservation.referenceNo}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setReservations((current) =>
      current.filter((item) => item.id !== reservation.id),
    );
  }

  function updateStatus(reservation, status) {
    setMenuId(null);
    setReservations((current) =>
      current.map((item) =>
        item.id === reservation.id ? { ...item, status } : item,
      ),
    );
  }

  function resetDemoData() {
    setReservations(DEFAULT_RESERVATIONS);
    setActiveStatus("All");
    setSearch("");
    setPage(1);
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
              Core Data Module
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">
                Reservations
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0b4f8a]">
                {reservations.length} total
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Create, view, update, and track guest room reservations.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b4f8a] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#083d6c]"
          >
            <Plus size={17} />
            New Reservation
          </button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {["All", ...RESERVATION_STATUSES].map((status) => {
                const selected = activeStatus === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setActiveStatus(status)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                      selected
                        ? "bg-[#0b4f8a] text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {status}
                    <span
                      className={`ml-1.5 ${
                        selected ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {counts[status]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by guest name, room, or reference number..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0b4f8a] focus:ring-2 focus:ring-blue-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <HeaderCell>Reference No.</HeaderCell>
                  <HeaderCell>Guest Name</HeaderCell>
                  <HeaderCell>Room</HeaderCell>
                  <HeaderCell>Check-in</HeaderCell>
                  <HeaderCell>Check-out</HeaderCell>
                  <HeaderCell>Status</HeaderCell>
                  <HeaderCell align="right">Actions</HeaderCell>
                </tr>
              </thead>

              <tbody>
                {visibleReservations.map((reservation) => {
                  const guest = guestById[reservation.guestId];
                  const room = roomById[reservation.roomId];

                  return (
                    <tr
                      key={reservation.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4 text-xs font-bold text-[#0b4f8a]">
                        {reservation.referenceNo}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setDetailReservation(reservation)}
                          className="text-left"
                        >
                          <p className="text-sm font-semibold text-slate-800 hover:text-[#0b4f8a]">
                            {guest?.name ?? "Unknown guest"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {guest?.email ?? "—"}
                          </p>
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {room?.name ?? reservation.roomId}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {formatDate(reservation.checkIn)}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {formatDate(reservation.checkOut)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASSES[reservation.status]}`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="relative px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setMenuId((current) =>
                              current === reservation.id
                                ? null
                                : reservation.id,
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          aria-label={`Actions for ${reservation.referenceNo}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {menuId === reservation.id && (
                          <div className="absolute right-4 top-12 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => setDetailReservation(reservation)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <CalendarDays size={15} />
                              View details
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(reservation)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Edit3 size={15} />
                              Edit
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            {RESERVATION_STATUSES.filter(
                              (status) => status !== reservation.status,
                            ).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() =>
                                  updateStatus(reservation, status)
                                }
                                className="flex w-full items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                              >
                                Mark {status}
                              </button>
                            ))}
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => handleDelete(reservation)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {visibleReservations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <CalendarDays size={24} />
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-slate-800">
                          No reservations found
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Change your search/filter or create a new
                          reservation.
                        </p>
                        <button
                          type="button"
                          onClick={openCreate}
                          className="mt-4 text-xs font-bold text-[#0b4f8a] hover:underline"
                        >
                          + New Reservation
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              Showing{" "}
              <strong className="text-slate-600">
                {filteredReservations.length === 0
                  ? 0
                  : (page - 1) * PAGE_SIZE + 1}
                –
                {Math.min(page * PAGE_SIZE, filteredReservations.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-600">
                {filteredReservations.length}
              </strong>{" "}
              reservations
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${
                      page === number
                        ? "bg-[#0b4f8a] text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {number}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Reservation records are stored in browser localStorage for this
            standalone Phase 2 prototype.
          </p>
          <button
            type="button"
            onClick={resetDemoData}
            className="font-semibold text-[#0b4f8a] hover:underline"
          >
            Reset demo reservations
          </button>
        </div>
      </div>

      {formOpen && (
        <ReservationFormModal
          reservation={editingReservation}
          guests={guests}
          rooms={rooms}
          reservations={reservations}
          onClose={() => {
            setFormOpen(false);
            setEditingReservation(null);
          }}
          onSave={handleSave}
        />
      )}

      {detailReservation && (
        <ReservationDetailModal
          reservation={detailReservation}
          guest={guestById[detailReservation.guestId]}
          room={roomById[detailReservation.roomId]}
          onClose={() => setDetailReservation(null)}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}

function HeaderCell({ children, align = "left" }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
