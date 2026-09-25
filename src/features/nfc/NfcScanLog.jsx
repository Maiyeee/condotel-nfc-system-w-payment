import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export default function NfcScanLog({ logs = [] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) =>
      [log.uid, log.guestName, log.roomNumber, log.location, log.result]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [logs, query]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">NFC Scan Logs</h2>
          <p className="text-sm text-slate-500">Recent NFC access attempts and authorization results.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scan logs..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3">Date / Time</th>
              <th className="px-5 py-3">UID</th>
              <th className="px-5 py-3">Guest</th>
              <th className="px-5 py-3">Room</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <tr key={log.id}>
                <td className="px-5 py-4">{new Date(log.scannedAt).toLocaleString()}</td>
                <td className="px-5 py-4 font-mono text-xs">{log.uid}</td>
                <td className="px-5 py-4">{log.guestName || "Unknown"}</td>
                <td className="px-5 py-4">{log.roomNumber || "—"}</td>
                <td className="px-5 py-4">{log.location}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    log.result === "Authorized" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">No scan logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
