import { CheckCircle2, Clock3, X, XCircle } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusClass,
} from "./transactionData";

const STATUS_ICONS = {
  Paid: CheckCircle2,
  Pending: Clock3,
  Failed: XCircle,
  Refunded: XCircle,
};

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

  const StatusIcon = STATUS_ICONS[transaction.status] || Clock3;

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
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b4f8a]">
              Transaction Details
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {transaction.transactionNo}
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

        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-[10px] text-slate-400">Transaction Amount</p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusClass(
                transaction.status,
              )}`}
            >
              <StatusIcon size={13} />
              {transaction.status}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Guest" value={transaction.guestName} />
            <Detail label="Room" value={transaction.room} />
            <Detail
              label="Reservation"
              value={transaction.reservationReference}
            />
            <Detail
              label="Payment Reference"
              value={transaction.paymentReference}
            />
            <Detail label="Payment Method" value={transaction.method} />
            <Detail
              label="Provider Reference"
              value={transaction.providerReference}
            />
            <Detail
              label="Processed At"
              value={formatDateTime(transaction.createdAt)}
            />
            <Detail label="Transaction ID" value={transaction.id} />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#083d6c]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-xs font-semibold text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}
