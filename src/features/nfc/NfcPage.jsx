import { useEffect, useMemo, useState } from "react";
import { Activity, CreditCard, Link2, Radio, ShieldCheck } from "lucide-react";
import NfcReader from "./NfcReader";
import NfcCardManager from "./NfcCardManager";
import NfcScanLog from "./NfcScanLog";
import { demoNfcCards, demoNfcScanLogs } from "./nfcData";
import { loadNfcCards, loadNfcScanLogs, saveNfcCards, saveNfcScanLogs } from "./nfcStorage";

function normalizeUid(value = "") {
  return value.trim().toUpperCase().replace(/:/g, "-");
}

export default function NfcPage() {
  const [cards, setCards] = useState(() => loadNfcCards(demoNfcCards));
  const [logs, setLogs] = useState(() => loadNfcScanLogs(demoNfcScanLogs));
  const [lastScan, setLastScan] = useState(null);
  const [demoUid, setDemoUid] = useState("");

  useEffect(() => saveNfcCards(cards), [cards]);
  useEffect(() => saveNfcScanLogs(logs), [logs]);

  const stats = useMemo(() => ({
    total: cards.length,
    active: cards.filter((c) => c.status === "Active").length,
    blocked: cards.filter((c) => c.status === "Blocked").length,
    scans: logs.length,
  }), [cards, logs]);

  function handleRead({ uid }) {
    const normalized = normalizeUid(uid);
    const card = cards.find((item) => normalizeUid(item.uid) === normalized);
    const authorized = Boolean(card && card.status === "Active");
    const scannedAt = new Date().toISOString();

    const log = {
      id: `scan-${Date.now()}`,
      uid: normalized,
      guestName: card?.guestName || "Unknown",
      roomNumber: card?.roomNumber || "",
      location: "NFC Reader",
      result: authorized ? "Authorized" : "Blocked",
      scannedAt,
    };

    setLastScan({ ...log, card });
    setLogs((current) => [log, ...current]);

    if (card) {
      setCards((current) =>
        current.map((item) =>
          item.id === card.id
            ? { ...item, lastScannedAt: scannedAt, lastLocation: "NFC Reader" }
            : item
        )
      );
    }
  }

  function demoScan() {
    const uid = normalizeUid(demoUid);
    if (!uid) return;
    handleRead({ uid });
    setDemoUid("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">NFC Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage guest NFC cards, scan access credentials, and review access logs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Registered Cards", stats.total, CreditCard],
          ["Active Cards", stats.active, ShieldCheck],
          ["Blocked Cards", stats.blocked, Activity],
          ["Scan Events", stats.scans, Radio],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NfcReader onRead={handleRead} />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Demo / Development Scan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter a registered UID to test the authorization flow without physical NFC hardware.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={demoUid}
              onChange={(e) => setDemoUid(e.target.value)}
              placeholder="04-A7-3C-91-22-6B-80"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm outline-none"
            />
            <button
              type="button"
              onClick={demoScan}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <Radio className="h-4 w-4" /> Test Scan
            </button>
          </div>

          {lastScan && (
            <div className={`mt-4 rounded-xl p-4 ${lastScan.result === "Authorized" ? "bg-emerald-50" : "bg-red-50"}`}>
              <div className="font-semibold">{lastScan.result}</div>
              <div className="mt-1 text-sm">
                UID: <span className="font-mono">{lastScan.uid}</span>
              </div>
              <div className="text-sm">
                {lastScan.card ? `${lastScan.card.guestName} • Room ${lastScan.card.roomNumber}` : "No active card matched this UID."}
              </div>
            </div>
          )}
        </div>
      </div>

      <NfcCardManager cards={cards} onUpdate={setCards} />
      <NfcScanLog logs={logs} />
    </div>
  );
}
