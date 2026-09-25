import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ShieldCheck } from "lucide-react";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentSummaryCard from "./PaymentSummaryCard";
import {
  DEFAULT_PAYMENTS,
  DEFAULT_RESERVATIONS,
  formatCurrency,
  getPaymentMethodLabel,
} from "./paymentData";
import {
  loadPaymentReservations,
  loadPayments,
  savePaymentReservations,
  savePayments,
} from "./paymentStorage";

export default function ProcessPaymentPage({ onPaymentProcessed }) {
  const [reservations, setReservations] = useState(() =>
    loadPaymentReservations(DEFAULT_RESERVATIONS),
  );
  const [payments, setPayments] = useState(() =>
    loadPayments(DEFAULT_PAYMENTS),
  );
  const [selectedId, setSelectedId] = useState(DEFAULT_RESERVATIONS[0]?.id);
  const [method, setMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  useEffect(() => {
    savePaymentReservations(reservations);
  }, [reservations]);

  const selectedReservation = useMemo(
    () => reservations.find((item) => item.id === selectedId) ?? null,
    [reservations, selectedId],
  );

  const balance = selectedReservation
    ? Math.max(
        0,
        Number(selectedReservation.totalAmount) -
          Number(selectedReservation.paidAmount || 0),
      )
    : 0;

  useEffect(() => {
    setAmount(balance ? String(balance) : "");
    setError("");
    setSuccess(null);
  }, [selectedId, balance]);

  function processPayment(event) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!selectedReservation) {
      setError("Select a reservation first.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (numericAmount > balance) {
      setError("Payment cannot be greater than the remaining balance.");
      return;
    }

    const paymentId = `pay-${Date.now()}`;
    const paymentReference = `PAY-${String(Date.now()).slice(-6)}`;
    const providerRef = `${method.toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const payment = {
      id: paymentId,
      reservationId: selectedReservation.id,
      referenceNo: paymentReference,
      reservationReference: selectedReservation.referenceNo,
      guestName: selectedReservation.guestName,
      amount: numericAmount,
      method,
      status: "Paid",
      providerRef,
      createdAt: new Date().toISOString(),
    };

    setPayments((current) => [payment, ...current]);

    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              paidAmount:
                Number(reservation.paidAmount || 0) + numericAmount,
            }
          : reservation,
      ),
    );

    setSuccess(payment);
    setAmount("");

    if (typeof onPaymentProcessed === "function") {
      onPaymentProcessed(payment);
    }
  }

  return (
    <div className="min-h-full bg-[#f5f8fc] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1250px]">
        <header className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4f8a]">
            Payments
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">
            Process Payment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Apply a payment to an existing reservation.
          </p>
        </header>

        {success && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Payment processed successfully
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  {success.referenceNo} · {formatCurrency(success.amount)} ·{" "}
                  {getPaymentMethodLabel(success.method)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(330px,0.95fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-900">
                Select Reservation
              </h2>
              <p className="mt-1 text-[11px] text-slate-400">
                Choose the reservation that should receive this payment.
              </p>
            </div>

            <div className="space-y-2">
              {reservations.map((reservation) => {
                const remaining = Math.max(
                  0,
                  Number(reservation.totalAmount) -
                    Number(reservation.paidAmount || 0),
                );
                const selected = reservation.id === selectedId;

                return (
                  <button
                    key={reservation.id}
                    type="button"
                    onClick={() => setSelectedId(reservation.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-[#0b4f8a] bg-blue-50/70 ring-1 ring-[#0b4f8a]"
                        : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {reservation.referenceNo}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {reservation.guestName} · {reservation.room}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Balance</p>
                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
              <div className="flex gap-2">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[#0b4f8a]"
                />
                <p className="text-[10px] leading-5 text-slate-600">
                  Card details are intentionally not collected by this
                  standalone module. A production card payment should use the
                  configured payment provider&apos;s hosted fields or SDK.
                </p>
              </div>
            </div>
          </section>

          <form
            onSubmit={processPayment}
            className="space-y-5"
          >
            <PaymentSummaryCard
              reservation={selectedReservation}
              amount={amount}
              onAmountChange={setAmount}
            />

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <PaymentMethodSelector value={method} onChange={setMethod} />

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedReservation || balance <= 0}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0b4f8a] text-sm font-bold text-white shadow-sm transition hover:bg-[#083d6c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Process Payment
              </button>

              <p className="mt-2 text-center text-[10px] text-slate-400">
                This standalone build records a demo transaction locally.
              </p>
            </section>
          </form>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              setSelectedId(reservations[0]?.id);
              setMethod("card");
              setSuccess(null);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0b4f8a]"
          >
            <ChevronLeft size={14} />
            Reset selection
          </button>
        </div>
      </div>
    </div>
  );
}
