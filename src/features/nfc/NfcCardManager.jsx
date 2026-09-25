import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Link2, Search, ShieldCheck, Trash2 } from "lucide-react";

function statusClass(status) {
  if (status === "Active") return "bg-emerald-50 text-emerald-700";
  if (status === "Blocked") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export default function NfcCardManager({ cards = [], onUpdate }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((card) =>
      [card.uid, card.cardNumber, card.guestName, card.roomNumber, card.reservationNumber]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [cards, query]);

  function updateStatus(id, status) {
    onUpdate?.(cards.map((card) => (card.id === id ? { ...card, status } : card)));
  }

  function unlink(id) {
    onUpdate?.(cards.filter((card) => card.id !== id));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">NFC Card Management</h2>
            <p className="text-sm text-slate-500">Link, block, activate, or unlink guest NFC cards.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search UID, guest, room..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3">Card</th>
              <th className="px-5 py-3">Guest</th>
              <th className="px-5 py-3">Room</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last Scan</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((card) => (
              <tr key={card.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">{card.cardNumber}</div>
                  <div className="font-mono text-xs text-slate-500">{card.uid}</div>
                </td>
                <td className="px-5 py-4">{card.guestName}</td>
                <td className="px-5 py-4">{card.roomNumber}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(card.status)}`}>
                    {card.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div>{card.lastLocation || "—"}</div>
                  <div className="text-xs text-slate-500">
                    {card.lastScannedAt ? new Date(card.lastScannedAt).toLocaleString() : "Never"}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {card.status === "Active" ? (
                      <button onClick={() => updateStatus(card.id, "Blocked")} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                        <Ban className="h-3.5 w-3.5" /> Block
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(card.id, "Active")} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" /> Activate
                      </button>
                    )}
                    <button onClick={() => unlink(card.id)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600">
                      <Trash2 className="h-3.5 w-3.5" /> Unlink
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">No NFC cards found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
