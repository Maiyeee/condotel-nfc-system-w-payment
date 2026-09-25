import { useMemo } from "react";
import { Download, Printer, X } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getPaymentMethodLabel,
} from "./paymentData";

export default function InvoiceModal({ payment, onClose }) {
  const invoiceNumber = useMemo(
    () => `INV-${payment.referenceNo.replace("PAY-", "")}`,
    [payment.referenceNo],
  );

  function printInvoice() {
    window.print();
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto my-6 max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="no-print flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b4f8a]">
              Receipt / Invoice Preview
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {invoiceNumber}
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

        <div id="payment-invoice" className="p-7 sm:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xl font-black tracking-tight text-[#0b4f8a]">
                CONDOTEL
              </div>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                NFC System with Payment
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold text-slate-800">PAYMENT RECEIPT</p>
              <p className="mt-1 text-xs text-slate-500">{invoiceNumber}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {formatDateTime(payment.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid gap-5 border-b border-slate-200 py-6 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Billed Guest
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {payment.guestName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Reservation: {payment.reservationReference}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payment Reference
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {payment.referenceNo}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Provider: {payment.providerRef}
              </p>
            </div>
          </div>

          <div className="py-6">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Description</span>
              <span>Amount</span>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 py-4 text-sm">
              <div>
                <p className="font-semibold text-slate-800">
                  Reservation payment
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Method: {getPaymentMethodLabel(payment.method)}
                </p>
              </div>
              <p className="font-bold text-slate-800">
                {formatCurrency(payment.amount)}
              </p>
            </div>

            <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
              <div className="flex w-full max-w-xs items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Total Paid</span>
                <span className="text-lg font-black text-[#0b4f8a]">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-[10px] leading-5 text-slate-500">
            This receipt represents the payment transaction recorded by the
            Condotel payment module. Production invoice numbering, tax details,
            and provider verification should be supplied by the backend.
          </div>
        </div>

        <div className="no-print flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={printInvoice}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            type="button"
            onClick={printInvoice}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b4f8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#083d6c]"
          >
            <Download size={15} />
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
