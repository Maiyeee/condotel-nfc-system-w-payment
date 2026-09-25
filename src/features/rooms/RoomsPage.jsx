import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  CheckCircle2,
  ChevronDown,
  Edit3,
  ImagePlus,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import RoomFormModal from "./RoomFormModal";
import { DEFAULT_ROOMS, ROOM_STATUSES } from "./roomData";
import { loadRooms, saveRooms } from "./roomStorage";

const STATUS_META = {
  Available: {
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Occupied: {
    className: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dot: "bg-red-500",
    icon: XCircle,
  },
  Maintenance: {
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
    icon: Wrench,
  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.Available;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="col-span-full flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <BedDouble size={26} />
      </div>
      <h3 className="text-base font-bold text-slate-900">No rooms found</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Try a different search or add a new room to your condotel inventory.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#083d6c]"
      >
        <Plus size={17} />
        Add Room
      </button>
    </div>
  );
}

function RoomCard({ room, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {room.photo ? (
          <img
            src={room.photo}
            alt={`${room.name} interior`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImagePlus size={34} />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <StatusBadge status={room.status} />
        </div>

        <div className="absolute right-3 top-3">
          <button
            type="button"
            aria-label={`Actions for ${room.name}`}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-600 shadow-sm backdrop-blur hover:bg-white"
          >
            <MoreVertical size={17} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(room);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit3 size={15} />
                Edit room
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(room.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete room
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{room.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {room.type} Room · Floor {room.floor}
            </p>
          </div>
          <p className="whitespace-nowrap text-sm font-bold text-slate-900">
            ₱{Number(room.rate).toLocaleString()}
            <span className="ml-1 text-[11px] font-medium text-slate-400">
              / night
            </span>
          </p>
        </div>

        {room.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
            {room.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <label className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            Status
            <select
              value={room.status}
              onChange={(event) => onStatusChange(room.id, event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#0b4f8a]"
            >
              {ROOM_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => onEdit(room)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b4f8a] hover:underline"
          >
            <Edit3 size={14} />
            Manage
          </button>
        </div>
      </div>
    </article>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState(() => loadRooms(DEFAULT_ROOMS));
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesStatus =
        activeStatus === "All" || room.status === activeStatus;

      const matchesSearch =
        !normalizedSearch ||
        [room.name, room.type, room.description, String(room.floor)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [rooms, activeStatus, search]);

  const counts = useMemo(
    () => ({
      All: rooms.length,
      Available: rooms.filter((room) => room.status === "Available").length,
      Occupied: rooms.filter((room) => room.status === "Occupied").length,
      Maintenance: rooms.filter((room) => room.status === "Maintenance").length,
    }),
    [rooms],
  );

  function openAddModal() {
    setEditingRoom(null);
    setModalOpen(true);
  }

  function openEditModal(room) {
    setEditingRoom(room);
    setModalOpen(true);
  }

  function handleSave(roomInput) {
    setRooms((current) => {
      if (editingRoom) {
        return current.map((room) =>
          room.id === editingRoom.id
            ? { ...room, ...roomInput, id: editingRoom.id }
            : room,
        );
      }

      return [
        ...current,
        {
          ...roomInput,
          id: `room-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ];
    });

    setModalOpen(false);
    setEditingRoom(null);
  }

  function handleDelete(id) {
    const room = rooms.find((item) => item.id === id);
    if (!room) return;

    const confirmed = window.confirm(
      `Delete ${room.name}? This action cannot be undone.`,
    );

    if (confirmed) {
      setRooms((current) => current.filter((item) => item.id !== id));
    }
  }

  function handleStatusChange(id, status) {
    setRooms((current) =>
      current.map((room) => (room.id === id ? { ...room, status } : room)),
    );
  }

  function handleResetDemoData() {
    setRooms(DEFAULT_ROOMS);
    setActiveStatus("All");
    setSearch("");
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
                Room Management
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0b4f8a]">
                {rooms.length} rooms
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage condotel units, room types, nightly rates, photos, and
              availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b4f8a] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#083d6c]"
          >
            <Plus size={17} />
            Add Room
          </button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", ...ROOM_STATUSES].map((status) => {
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

            <div className="relative w-full xl:max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by room, type, floor..."
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

        <section className="mt-5">
          {filteredRooms.length === 0 ? (
            <div className="grid">
              <EmptyState onAdd={openAddModal} />
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Room data is currently stored in your browser using localStorage.
            It is ready to be connected to the Phase 2 rooms API later.
          </p>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 font-semibold text-[#0b4f8a] hover:underline"
          >
            <ChevronDown size={14} />
            Reset demo rooms
          </button>
        </div>
      </div>

      {modalOpen && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => {
            setModalOpen(false);
            setEditingRoom(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
