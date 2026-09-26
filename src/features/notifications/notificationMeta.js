import { LogIn, LogOut, CreditCard, CalendarCheck, BedDouble, Nfc } from "lucide-react";

export const TYPE_META = {
  "Check-in": { icon: LogIn, classes: "bg-emerald-50 text-emerald-600" },
  "Check-out": { icon: LogOut, classes: "bg-slate-100 text-slate-500" },
  Payment: { icon: CreditCard, classes: "bg-blue-50 text-[#0b4f8a]" },
  Reservation: { icon: CalendarCheck, classes: "bg-blue-50 text-[#0b4f8a]" },
  Room: { icon: BedDouble, classes: "bg-amber-50 text-amber-600" },
  "NFC Card": { icon: Nfc, classes: "bg-red-50 text-red-600" },
};

export function formatRelativeTime(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(date);
}
