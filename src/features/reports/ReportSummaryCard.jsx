const TONES = {
  blue: "bg-[#0b4f8a]",
  green: "bg-emerald-600",
  amber: "bg-amber-500",
  purple: "bg-violet-600",
};

export default function ReportSummaryCard({ label, value, helper, icon: Icon, tone = "blue" }) {
  return (
    <div className={`flex min-h-[110px] flex-col justify-between rounded-xl p-5 text-white shadow-sm ${TONES[tone]}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-white/80">{label}</span>
        {Icon && <Icon size={18} className="text-white/70" />}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {helper && <p className="mt-0.5 text-[11px] text-white/75">{helper}</p>}
      </div>
    </div>
  );
}
