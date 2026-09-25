import clsx from 'clsx'

const TONES = {
  blue: 'bg-brand-500',
  green: 'bg-success-600',
  amber: 'bg-warning-600',
  purple: 'bg-purple-500',
}

export default function StatCard({ label, value, hint, icon: Icon, tone = 'blue' }) {
  return (
    <div className={clsx('rounded-xl p-5 text-white shadow-sm', TONES[tone])}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-white/85">{label}</span>
        {Icon && <Icon className="h-5 w-5 text-white/70" />}
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-white/75">{hint}</div>}
    </div>
  )
}
