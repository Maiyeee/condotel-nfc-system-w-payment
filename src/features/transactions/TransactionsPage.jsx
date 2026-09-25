import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import TransactionDetailModal from "./TransactionDetailModal";
import TransactionTable from "./TransactionTable";
import {
  DEFAULT_TRANSACTIONS,
  STATUS_FILTERS,
  formatCurrency,
} from "./transactionData";
import {
  loadTransactions,
  saveTransactions,
} from "./transactionStorage";

const PAGE_SIZE = 7;

export default function TransactionsPage({
  transactions: transactionsProp,
}) {
  const [transactions, setTransactions] = useState(() =>
    transactionsProp || loadTransactions(DEFAULT_TRANSACTIONS),
  );
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (!transactionsProp) saveTransactions(transactions);
  }, [transactions, transactionsProp]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const statusMatch =
        status === "All" || transaction.status === status;

      const searchMatch =
        !query ||
        [
          transaction.transactionNo,
          transaction.paymentReference,
          transaction.reservationReference,
          transaction.guestName,
          transaction.room,
          transaction.method,
          transaction.providerReference,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return statusMatch && searchMatch;
    });
  }, [transactions, status, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE),
  );

  const visibleTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = useMemo(() => {
    const paid = transactions.filter((item) => item.status === "Paid");
    const pending = transactions.filter((item) => item.status === "Pending");
    const failed = transactions.filter((item) => item.status === "Failed");

    return {
      total: transactions.length,
      paidAmount: paid.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
      pendingCount: pending.length,
      failedCount: failed.length,
    };
  }, [transactions]);

  function clearFilters() {
    setStatus("All");
    setSearch("");
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
            Phase 4 · Payments
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review payment transactions and open individual transaction
            details.
          </p>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ReceiptText}
            label="Total Transactions"
            value={stats.total}
          />
          <StatCard
            icon={WalletCards}
            label="Paid Amount"
            value={formatCurrency(stats.paidAmount)}
          />
          <StatCard
            icon={ReceiptText}
            label="Pending"
            value={stats.pendingCount}
          />
          <StatCard
            icon={ReceiptText}
            label="Failed"
            value={stats.failedCount}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatus(filter)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    status === filter
                      ? "bg-[#0b4f8a] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative w-full xl:max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transaction, guest, reservation..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0b4f8a] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {(status !== "All" || search) && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-400">
                {filteredTransactions.length} matching transaction
                {filteredTransactions.length === 1 ? "" : "s"}
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-semibold text-[#0b4f8a] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TransactionTable
            transactions={visibleTransactions}
            onView={setSelectedTransaction}
          />

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              Showing{" "}
              {filteredTransactions.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1}
              –{Math.min(page * PAGE_SIZE, filteredTransactions.length)} of{" "}
              {filteredTransactions.length}
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

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              ).map((number) => (
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
              ))}

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

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0b4f8a]">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-slate-800">{value}</p>
    </div>
  );
}
