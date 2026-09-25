import { Eye } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getStatusClass,
} from "./transactionData";

export default function TransactionTable({ transactions, onView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            {[
              "Transaction",
              "Guest",
              "Reservation",
              "Method",
              "Amount",
              "Status",
              "Date & Time",
              "Action",
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
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
            >
              <td className="px-4 py-4">
                <p className="text-xs font-bold text-[#0b4f8a]">
                  {transaction.transactionNo}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {transaction.paymentReference}
                </p>
              </td>

              <td className="px-4 py-4">
                <p className="text-xs font-semibold text-slate-700">
                  {transaction.guestName}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {transaction.room}
                </p>
              </td>

              <td className="px-4 py-4 text-xs text-slate-500">
                {transaction.reservationReference}
              </td>

              <td className="px-4 py-4 text-xs text-slate-600">
                {transaction.method}
              </td>

              <td className="px-4 py-4 text-xs font-bold text-slate-800">
                {formatCurrency(transaction.amount)}
              </td>

              <td className="px-4 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                    transaction.status,
                  )}`}
                >
                  {transaction.status}
                </span>
              </td>

              <td className="px-4 py-4 text-xs text-slate-500">
                {formatDateTime(transaction.createdAt)}
              </td>

              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => onView(transaction)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0b4f8a]"
                >
                  <Eye size={14} />
                  View
                </button>
              </td>
            </tr>
          ))}

          {transactions.length === 0 && (
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
  );
}
