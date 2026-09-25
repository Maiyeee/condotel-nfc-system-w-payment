import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, ScanLine, ShieldAlert } from "lucide-react";

export default function NfcReader({ onRead, disabled = false }) {
  const [supported, setSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("Ready to scan an NFC card.");
  const readerRef = useRef(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "NDEFReader" in window);
  }, []);

  async function startScan() {
    if (disabled || scanning) return;

    if (!supported) {
      setMessage("Web NFC is not available in this browser/device. Use the demo UID input below.");
      return;
    }

    try {
      const reader = new window.NDEFReader();
      readerRef.current = reader;
      await reader.scan();

      setScanning(true);
      setMessage("Hold the NFC card near the device.");

      reader.onreading = (event) => {
        const serialNumber = event.serialNumber || "N/A";
        const uid = serialNumber
          .split(":")
          .map((part) => part.toUpperCase().padStart(2, "0"))
          .join("-");

        setMessage(`NFC card detected: ${uid}`);
        onRead?.({ uid, rawEvent: event });
        setScanning(false);
      };

      reader.onreadingerror = () => {
        setMessage("The NFC card could not be read. Try again.");
        setScanning(false);
      };
    } catch (error) {
      setScanning(false);
      setMessage(error?.message || "Unable to start NFC scanning.");
    }
  }

  function stopScan() {
    readerRef.current = null;
    setScanning(false);
    setMessage("Scan stopped.");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-3">
          <ScanLine className="h-6 w-6 text-slate-700" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">NFC Reader</h3>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        {scanning && <Loader2 className="h-5 w-5 animate-spin text-slate-600" />}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!scanning ? (
          <button
            type="button"
            onClick={startScan}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            Start NFC Scan
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScan}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Stop Scan
          </button>
        )}
      </div>

      {!supported && (
        <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Browser NFC support is limited. The module includes a demo UID mode for development.</span>
        </div>
      )}

      {supported && !scanning && (
        <div className="mt-4 flex gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Web NFC API detected.
        </div>
      )}
    </div>
  );
}
