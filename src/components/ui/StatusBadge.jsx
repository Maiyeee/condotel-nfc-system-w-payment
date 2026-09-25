import { STATUS_STYLES } from '@/lib/constants'

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase().trim()
  const style = STATUS_STYLES[key] || 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  )
}
