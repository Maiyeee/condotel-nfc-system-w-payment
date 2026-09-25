import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { Building2 } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy-900 text-slate-300">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide text-white">CONDOTEL</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">NFC System w/ Payment</div>
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-xs font-semibold text-white">
          {user?.name?.[0] ?? '?'}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white">{user?.name}</div>
          <div className="truncate text-xs capitalize text-slate-400">{user?.role} Administrator</div>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3">
        {items.map((item) => {
          const Icon = Icons[item.icon] ?? Icons.Circle
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-3 pb-5 pt-2 text-center text-[11px] text-slate-500">
        Condotel NFC System v0.1
      </div>
    </aside>
  )
}
