import { CalendarDays, Pencil, UserRound, X } from "lucide-react";

const STATUS_CLASSES = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-blue-50 text-blue-700",
  "Checked-in": "bg-emerald-50 text-emerald-700",
  "Checked-out": "bg-slate-100 text-slate-600",
};

export default function ReservationDetailModal({
  reservation,
  guest,
  room,
  onClose,
  onEdit,
}) {
  if (!reservation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
              Reservation Details
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {reservation.referenceNo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  STATUS_CLASSES[reservation.status] ?? STATUS_CLASSES.Pending
                }`}
              >
                {reservation.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Room</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {room?.name ?? reservation.roomId}
              </p>
            </div>
          </div>

          <DetailRow
            icon={UserRound}
            label="Guest"
            value={guest?.name ?? reservation.guestId}
          />
          <DetailRow
            icon={CalendarDays}
            label="Stay"
            value={`${formatDate(reservation.checkIn)} — ${formatDate(
              reservation.checkOut,
            )}`}
          />

          <div className="grid grid-cols-2 gap-3">
            <Info label="Room Type" value={room?.type ?? "—"} />
            <Info
              label="Nightly Rate"
              value={
                room
                  ? `₱${Number(room.rate).toLocaleString()}`
                  : "—"
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onEdit(reservation)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#083d6c]"
          >
            <Pencil size={15} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f8a]">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
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
