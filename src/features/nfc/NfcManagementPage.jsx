import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Ban,
  CheckCircle2,
  CreditCard,
  Link2,
  Radio,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import NfcReader from "./NfcReader";
import NfcCardManager from "./NfcCardManager";
import NfcScanLog from "./NfcScanLog";
import { demoNfcCards, demoNfcScanLogs } from "./nfcData";
import {
  loadNfcCards,
  loadNfcScanLogs,
  saveNfcCards,
  saveNfcScanLogs,
} from "./nfcStorage";

function normalizeUid(value = "") {
  return value.trim().toUpperCase().replace(/:/g, "-");
}

export default function NfcManagementPage() {
  const [cards, setCards] = useState(() => loadNfcCards(demoNfcCards));
  const [logs, setLogs] = useState(() => loadNfcScanLogs(demoNfcScanLogs));
  const [lastScan, setLastScan] = useState(null);
  const [demoUid, setDemoUid] = useState("");

  useEffect(() => saveNfcCards(cards), [cards]);
  useEffect(() => saveNfcScanLogs(logs), [logs]);

  const stats = useMemo(
    () => ({
      total: cards.length,
      active: cards.filter((card) => card.status === "Active").length,
      blocked: cards.filter((card) => card.status === "Blocked").length,
      scans: logs.length,
    }),
    [cards, logs]
  );

  function handleRead({ uid }) {
    const normalized = normalizeUid(uid);
    const card = cards.find(
      (item) => normalizeUid(item.uid) === normalized
    );
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
            ? {
                ...item,
                lastScannedAt: scannedAt,
                lastLocation: "NFC Reader",
              }
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
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-3">
            <ScanLine className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              NFC Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage guest NFC cards, scan access credentials, and review NFC
              access activity.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Registered Cards", stats.total, CreditCard],
          ["Active Cards", stats.active, ShieldCheck],
          ["Blocked Cards", stats.blocked, Ban],
          ["Scan Events", stats.scans, Activity],
        ].map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NfcReader onRead={handleRead} />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Radio className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Demo / Development Scan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Test an NFC UID without physical NFC hardware.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={demoUid}
              onChange={(event) => setDemoUid(event.target.value)}
              placeholder="04-A7-3C-91-22-6B-80"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
            />
            <button
              type="button"
              onClick={demoScan}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <Radio className="h-4 w-4" />
              Test Scan
            </button>
          </div>

          {lastScan && (
            <div
              className={`mt-4 rounded-xl p-4 ${
                lastScan.result === "Authorized"
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-red-50 text-red-900"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {lastScan.result === "Authorized" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Ban className="h-5 w-5" />
                )}
                {lastScan.result}
              </div>

              <div className="mt-2 text-sm">
                UID:{" "}
                <span className="font-mono font-medium">
                  {lastScan.uid}
                </span>
              </div>

              <div className="text-sm">
                {lastScan.card
                  ? `${lastScan.card.guestName} • Room ${lastScan.card.roomNumber}`
                  : "No active card matched this UID."}
              </div>
            </div>
          )}
        </div>
      </div>

      <NfcCardManager cards={cards} onUpdate={setCards} />

      <NfcScanLog logs={logs} />

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-start gap-2">
          <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            NFC cards are currently linked to guest and reservation demo data.
            The module can later be connected to the backend for real-time
            authorization and access-control events.
          </p>
        </div>
      </div>
    </div>
  );
}
