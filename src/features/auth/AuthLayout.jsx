import { Building2 } from 'lucide-react'
import heroImg from '@/assets/hero.png'

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-950 p-10 text-white lg:flex">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/10" />

        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-wide">CONDOTEL</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-300">NFC System with Payment</div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-2xl font-semibold">Smart Access. Seamless Stays.</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-300">
            Modern condotel management with NFC access and cashless payment.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
