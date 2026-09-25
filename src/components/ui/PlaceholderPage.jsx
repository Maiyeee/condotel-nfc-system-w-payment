export default function PlaceholderPage({ title, phase, description }) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center">
      <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {phase && (
        <span className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          Scheduled for {phase}
        </span>
      )}
    </div>
  )
}
