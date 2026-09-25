import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
} from "lucide-react";
import TransactionDetailModal from "./TransactionDetailModal";
import InvoiceModal from "./InvoiceModal";
import {
  DEFAULT_PAYMENTS,
  formatCurrency,
  formatDateTime,
  getPaymentMethodLabel,
} from "./paymentData";
import { loadPayments } from "./paymentStorage";

const PAGE_SIZE = 6;
const FILTERS = ["All", "Paid", "Pending", "Failed", "Refunded"];

const STATUS_CLASSES = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-700",
  Refunded: "bg-slate-100 text-slate-600",
};

export default function TransactionHistoryPage({
  payments: paymentsProp,
}) {
  const [payments] = useState(() =>
    paymentsProp || loadPayments(DEFAULT_PAYMENTS),
  );
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoicePayment, setInvoicePayment] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const statusMatch = filter === "All" || payment.status === filter;

      const searchMatch =
        !query ||
        [
          payment.referenceNo,
          payment.reservationReference,
          payment.guestName,
          payment.providerRef,
          getPaymentMethodLabel(payment.method),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return statusMatch && searchMatch;
    });
  }, [payments, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
            Payments
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">
            Transaction History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and filter recorded payment transactions.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                    filter === item
                      ? "bg-[#0b4f8a] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transaction, guest, reservation, or provider reference..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0b4f8a] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "Transaction",
                    "Guest",
                    "Reservation",
                    "Method",
                    "Amount",
                    "Status",
                    "Processed",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visible.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-[#0b4f8a]">
                        {payment.referenceNo}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {payment.providerRef}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-700">
                      {payment.guestName}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {payment.reservationReference}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {getPaymentMethodLabel(payment.method)}
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-800">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          STATUS_CLASSES[payment.status] ||
                          STATUS_CLASSES.Pending
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {formatDateTime(payment.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(payment)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0b4f8a]"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoicePayment(payment)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0b4f8a]"
                          title="View receipt"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visible.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-xs text-slate-400"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} transactions
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedPayment && (
        <TransactionDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onInvoice={(payment) => {
            setSelectedPayment(null);
            setInvoicePayment(payment);
          }}
        />
      )}

      {invoicePayment && (
        <InvoiceModal
          payment={invoicePayment}
          onClose={() => setInvoicePayment(null)}
        />
      )}
    </div>
  );
}
