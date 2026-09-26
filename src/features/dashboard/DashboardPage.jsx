import { useMemo, useState } from "react";
import {
  BedDouble,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import OccupancyChart from "./OccupancyChart";
import RecentReservationsTable from "./RecentReservationsTable";
import StatCard from "./StatCard";
import { DEMO_DASHBOARD, formatCurrency } from "./dashboardData";
import { loadDashboard } from "./dashboardStorage";

export default function DashboardPage({
  dashboardData,
  userName = "Admin",
  onNavigate,
}) {
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [showPayments, setShowPayments] = useState(false);

  const data = useMemo(
    () => dashboardData || loadDashboard(DEMO_DASHBOARD),
    [dashboardData],
  );

  const stats = data.stats || DEMO_DASHBOARD.stats;

  function navigate(target) {
    if (typeof onNavigate === "function") {
      onNavigate(target);
    }
  }

  function refreshDemo() {
    setLastUpdated(new Date());
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
              Admin Dashboard
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">
              Good Morning, {userName}!
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s what&apos;s happening with your condotel today.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshDemo}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 lg:self-auto"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </header>

        <div className="mb-2 flex justify-end">
          <span className="text-[10px] text-slate-400">
            Updated{" "}
            {lastUpdated.toLocaleTimeString("en-PH", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Fixed KPI cards: solid white cards with visible dark text/icons. */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Rooms"
            value={stats.totalRooms}
            helper={`+${stats.availableRooms} available`}
            icon={BedDouble}
            onClick={() => navigate("rooms")}
          />

          <StatCard
            label="Current Guests"
            value={stats.currentGuests}
            helper={`${stats.occupancyRate}% occupancy`}
            icon={UsersRound}
            onClick={() => navigate("guests")}
          />

          <StatCard
            label="Today's Check-ins"
            value={stats.todaysCheckIns}
            helper="View details"
            icon={CalendarCheck}
            onClick={() => navigate("reservations")}
          />

          <StatCard
            label="Today's Payments"
            value={formatCurrency(stats.todaysPayments)}
            helper="View payment activity"
            icon={CreditCard}
            onClick={() => setShowPayments((value) => !value)}
          />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.7fr)]">
          <RecentReservationsTable
            reservations={data.recentReservations || []}
            onViewAll={() => navigate("reservations")}
          />

          <OccupancyChart
            data={data.occupancy || []}
            occupancyRate={stats.occupancyRate}
          />
        </section>

        {showPayments && (
          <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Today&apos;s Payments
                </h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  Payment summary shown by the dashboard data source.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPayments(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Hide
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["Guest", "Reference", "Method", "Amount", "Status"].map(
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
                  {(data.todaysPayments || []).map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3 text-xs font-semibold text-slate-800">
                        {payment.guestName}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {payment.referenceNo}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {payment.method}
                      </td>
                      <td className="px-5 py-3 text-xs font-bold text-slate-800">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <QuickLink
            title="Manage Rooms"
            description="Review room availability and status."
            onClick={() => navigate("rooms")}
          />
          <QuickLink
            title="Manage Guests"
            description="Open guest profiles and records."
            onClick={() => navigate("guests")}
          />
          <QuickLink
            title="Manage Reservations"
            description="Review upcoming and active bookings."
            onClick={() => navigate("reservations")}
          />
        </section>
      </div>
    </div>
  );
}

function QuickLink({ title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>

      <ChevronRight
        size={17}
        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0b4f8a]"
      />
    </button>
  );
}
