import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, icon: Icon, error, className, ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <span className="relative flex items-center">
        {Icon && <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-lg border bg-white py-2.5 text-sm text-slate-800 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-navy-700/30 focus:border-navy-700',
            Icon ? 'pl-9 pr-3' : 'px-3',
            error ? 'border-danger-600' : 'border-slate-300',
            className
          )}
          {...props}
        />
      </span>
      {error && <span className="mt-1 block text-xs text-danger-600">{error}</span>}
    </label>
  )
})

export default Input
