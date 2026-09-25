export default function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName = "bg-blue-50 text-[#0b4f8a]",
  valueClassName = "text-slate-900",
  onClick,
}) {
  const content = (
    <>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon size={21} strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-white/75">{label}</p>
        <p className={`mt-1 text-2xl font-bold tracking-tight ${valueClassName}`}>
          {value}
        </p>
        {helper && <p className="mt-1 text-[11px] text-white/75">{helper}</p>}
      </div>
    </>
  );

  const className =
    "flex min-h-[126px] items-start gap-4 rounded-xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} w-full text-left`}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
