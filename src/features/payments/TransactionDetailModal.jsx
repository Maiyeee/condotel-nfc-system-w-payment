import { FileText, X } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getPaymentMethodLabel,
} from "./paymentData";

export default function TransactionDetailModal({
  payment,
  onClose,
  onInvoice,
}) {
  if (!payment) return null;

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
              {payment.referenceNo}
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
              <p className="text-[10px] text-slate-400">Amount</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              {payment.status}
            </span>
          </div>

          <Detail label="Guest" value={payment.guestName} />
          <Detail label="Reservation" value={payment.reservationReference} />
          <Detail
            label="Payment Method"
            value={getPaymentMethodLabel(payment.method)}
          />
          <Detail label="Provider Reference" value={payment.providerRef} />
          <Detail label="Processed" value={formatDateTime(payment.createdAt)} />
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
            onClick={() => onInvoice(payment)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#083d6c]"
          >
            <FileText size={15} />
            View Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-right text-xs font-semibold text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}
