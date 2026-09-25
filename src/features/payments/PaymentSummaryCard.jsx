import { CalendarDays, UserRound } from "lucide-react";
import { formatCurrency } from "./paymentData";

export default function PaymentSummaryCard({
  reservation,
  amount,
  onAmountChange,
}) {
  if (!reservation) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-semibold text-slate-600">
          Select a reservation
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Reservation details will appear here.
        </p>
      </div>
    );
  }

  const remaining = Math.max(
    0,
    Number(reservation.totalAmount) - Number(reservation.paidAmount || 0),
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b4f8a]">
          Reservation Details
        </p>
        <h2 className="mt-1 text-base font-bold text-slate-900">
          {reservation.referenceNo}
        </h2>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f8a]">
            <UserRound size={17} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Guest</p>
            <p className="text-sm font-semibold text-slate-800">
              {reservation.guestName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f8a]">
            <CalendarDays size={17} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Stay</p>
            <p className="text-sm font-semibold text-slate-800">
              {reservation.checkIn} — {reservation.checkOut}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Info label="Room" value={reservation.room} />
          <Info
            label="Reservation Total"
            value={formatCurrency(reservation.totalAmount)}
          />
          <Info
            label="Paid"
            value={formatCurrency(reservation.paidAmount)}
          />
          <Info label="Balance" value={formatCurrency(remaining)} />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Amount to Pay
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              ₱
            </span>
            <input
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              type="number"
              min="0"
              max={remaining}
              step="0.01"
              inputMode="decimal"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm font-bold text-slate-800 outline-none focus:border-[#0b4f8a] focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">
            Maximum available balance: {formatCurrency(remaining)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}
