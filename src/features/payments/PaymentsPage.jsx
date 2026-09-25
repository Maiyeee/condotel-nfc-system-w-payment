import { useMemo, useState } from "react";
import { CreditCard, History, WalletCards } from "lucide-react";
import ProcessPaymentPage from "./ProcessPaymentPage";
import TransactionHistoryPage from "./TransactionHistoryPage";
import { DEFAULT_PAYMENTS, formatCurrency } from "./paymentData";
import { loadPayments } from "./paymentStorage";

const TABS = [
  {
    id: "process",
    label: "Process Payment",
    icon: CreditCard,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: History,
  },
];

export default function PaymentsPage({ initialTab = "process" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [refreshKey, setRefreshKey] = useState(0);

  const payments = useMemo(() => {
    // Re-read local demo transactions after a payment is processed.
    void refreshKey;
    return loadPayments(DEFAULT_PAYMENTS);
  }, [refreshKey]);

  const totalPaid = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  function handlePaymentProcessed() {
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="min-h-full bg-[#f5f8fc]">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-7">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b4f8a]">
              <WalletCards size={19} />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#102a43]">Payments</h1>
              <p className="text-[11px] text-slate-400">
                Process payments and review transaction history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-lg bg-slate-50 px-3 py-2 text-right sm:block">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Recorded Paid
              </p>
              <p className="text-sm font-bold text-[#0b4f8a]">
                {formatCurrency(totalPaid)}
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "bg-white text-[#0b4f8a] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {activeTab === "process" ? (
        <ProcessPaymentPage onPaymentProcessed={handlePaymentProcessed} />
      ) : (
        <TransactionHistoryPage
          key={refreshKey}
          payments={payments}
        />
      )}
    </div>
  );
}
