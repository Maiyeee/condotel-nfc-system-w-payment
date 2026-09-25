import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Drawer({ open, onClose, title, children }) {
  return (
    <div className={clsx('fixed inset-0 z-50', !open && 'pointer-events-none')}>
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/50 transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
