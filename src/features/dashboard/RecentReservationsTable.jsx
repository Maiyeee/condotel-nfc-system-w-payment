import { ArrowRight } from "lucide-react";
import { formatDate } from "./dashboardData";

const STATUS_CLASSES = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-blue-50 text-blue-700",
  "Checked-in": "bg-emerald-50 text-emerald-700",
  "Checked-out": "bg-slate-100 text-slate-600",
};

export default function RecentReservationsTable({
  reservations,
  onViewAll,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Recent Reservations
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">
            Latest booking activity
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b4f8a] hover:underline"
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {["Guest Name", "Room", "Check-in", "Check-out", "Status"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr
                key={reservation.referenceNo}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-5 py-3.5">
                  <p className="text-xs font-semibold text-slate-800">
                    {reservation.guestName}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {reservation.referenceNo}
                  </p>
                </td>
                <td className="px-5 py-3.5 text-xs font-medium text-slate-600">
                  {reservation.room}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {formatDate(reservation.checkIn)}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">
                  {formatDate(reservation.checkOut)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      STATUS_CLASSES[reservation.status] ||
                      STATUS_CLASSES.Pending
                    }`}
                  >
                    {reservation.status}
                  </span>
                </td>
              </tr>
            ))}

            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-xs text-slate-400">
                  No recent reservations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
