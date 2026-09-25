import {
  Building2,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { PAYMENT_METHODS } from "./paymentData";

const ICONS = {
  card: CreditCard,
  gcash: Smartphone,
  maya: Smartphone,
  bank_transfer: Building2,
};

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div>
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-800">Payment Method</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Select the checkout method for this reservation.
        </p>
      </div>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = ICONS[method.id];
          const selected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-[#0b4f8a] bg-blue-50/70 ring-1 ring-[#0b4f8a]"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  selected
                    ? "bg-[#0b4f8a] text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon size={17} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800">
                  {method.label}
                </span>
                <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">
                  {method.description}
                </span>
              </span>

              <span
                className={`h-4 w-4 rounded-full border-2 ${
                  selected
                    ? "border-[#0b4f8a] bg-[#0b4f8a] ring-2 ring-blue-100"
                    : "border-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
