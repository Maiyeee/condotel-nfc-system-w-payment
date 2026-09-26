import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Wallet, BedDouble, CalendarCheck, AlertTriangle } from "lucide-react";
import ReportSummaryCard from "./ReportSummaryCard";
import { DEFAULT_ROOMS } from "../rooms/roomData";
import { loadRooms } from "../rooms/roomStorage";
import { DEFAULT_RESERVATIONS } from "../reservations/reservationData";
import { loadReservations } from "../reservations/reservationStorage";
import { DEFAULT_TRANSACTIONS } from "../transactions/transactionData";
import { loadTransactions } from "../transactions/transactionStorage";
import {
  DATE_RANGES,
  filterByDateRange,
  revenueSummary,
  revenueByDay,
  revenueByMethod,
  revenueByRoom,
  occupancySummary,
  reservationsSummary,
  formatCurrency,
  formatShortDate,
} from "./reportSelectors";
import { buildReportCsv, downloadCsv } from "./exportCsv";

const PIE_COLORS = ["#0b4f8a", "#22a06b", "#d97706", "#7c3aed", "#64748b"];

export default function ReportsPage() {
  const [range, setRange] = useState("30 Days");

  const rooms = useMemo(() => loadRooms(DEFAULT_ROOMS), []);
  const reservations = useMemo(
    () => loadReservations(DEFAULT_RESERVATIONS),
    [],
  );
  const transactions = useMemo(
    () => loadTransactions(DEFAULT_TRANSACTIONS),
    [],
  );

  const rangedTransactions = useMemo(
    () => filterByDateRange(transactions, "createdAt", range),
    [transactions, range],
  );

  const rangedReservations = useMemo(
    () => filterByDateRange(reservations, "createdAt", range),
    [reservations, range],
  );

  const revenue = useMemo(
    () => revenueSummary(rangedTransactions),
    [rangedTransactions],
  );
  const byDay = useMemo(
    () => revenueByDay(rangedTransactions),
    [rangedTransactions],
  );
  const byMethod = useMemo(
    () => revenueByMethod(rangedTransactions),
    [rangedTransactions],
  );
  const byRoom = useMemo(
    () => revenueByRoom(rangedTransactions),
    [rangedTransactions],
  );
  const occupancy = useMemo(() => occupancySummary(rooms), [rooms]);
  const reservationStats = useMemo(
    () => reservationsSummary(rangedReservations),
    [rangedReservations],
  );

  function handleExport() {
    const csv = buildReportCsv({
      range,
      revenue,
      byDay,
      byMethod,
      byRoom,
      occupancy,
      reservations: reservationStats,
    });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`condotel-report-${stamp}.csv`, csv);
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
              Phase 6
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">
              Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Occupancy and revenue trends aggregated from your Rooms,
              Reservations, and Transactions data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
              {DATE_RANGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    range === option
                      ? "bg-[#0b4f8a] text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0b4f8a] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#083d6c]"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReportSummaryCard
            label={`Revenue (${range})`}
            value={formatCurrency(revenue.totalRevenue)}
            helper={`${revenue.paidCount} paid transaction${revenue.paidCount === 1 ? "" : "s"}`}
            icon={Wallet}
            tone="blue"
          />
          <ReportSummaryCard
            label="Occupancy Rate"
            value={`${occupancy.rate}%`}
            helper={`${occupancy.occupied} of ${occupancy.total} rooms occupied`}
            icon={BedDouble}
            tone="green"
          />
          <ReportSummaryCard
            label={`Reservations (${range})`}
            value={reservationStats.total}
            helper="Created in this range"
            icon={CalendarCheck}
            tone="purple"
          />
          <ReportSummaryCard
            label="Failed / Pending"
            value={`${revenue.failedCount} / ${revenue.pendingCount}`}
            helper="Transactions needing follow-up"
            icon={AlertTriangle}
            tone="amber"
          />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Revenue Trend</h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  Paid transaction totals per day, {range.toLowerCase()}.
                </p>
              </div>
            </div>

            <div className="mt-3 h-[260px]">
              {byDay.length === 0 ? (
                <EmptyChartState message="No paid transactions in this range yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₱${v / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                      labelFormatter={formatShortDate}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="total" fill="#0b4f8a" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Revenue by Method</h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Share of paid revenue per payment method.
            </p>

            <div className="mt-2 h-[220px]">
              {byMethod.length === 0 ? (
                <EmptyChartState message="No payment method data yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byMethod}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {byMethod.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatCurrency(value), name]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,1fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Rooms by Type</h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Total vs. currently occupied, per room type.
            </p>

            <div className="mt-3 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancy.byType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Total rooms" fill="#64748b" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="occupied" name="Occupied" fill="#0b4f8a" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-900">Top Rooms by Revenue</h2>
              <p className="mt-1 text-[11px] text-slate-400">
                Highest-earning rooms, {range.toLowerCase()}.
              </p>
            </div>

            {byRoom.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyChartState message="No paid transactions to rank yet." />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Room
                    </th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {byRoom.map((row) => (
                    <tr key={row.room} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                        {row.room}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-bold text-slate-800">
                        {formatCurrency(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-slate-600">
          Reports are computed live from the Rooms, Reservations, and
          Transactions data already stored for this prototype — no separate
          reports dataset is kept.
        </div>
      </div>
    </div>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">
      {message}
    </div>
  );
}
