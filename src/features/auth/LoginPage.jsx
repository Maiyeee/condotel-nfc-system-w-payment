import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import AuthLayout from './AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, password }) => {
    const ok = await login(email, password)
    if (ok) {
      navigate(from, { replace: true })
    } else {
      setError('root', { message: 'Invalid email or password.' })
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-slate-800">Welcome Back!</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email or Username"
          icon={Mail}
          type="email"
          placeholder="you@condotel.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <Input
            label="Password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-[38px] text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="rounded border-slate-300" />
            Remember me
          </label>
          <a href="#" className="font-medium text-brand-500 hover:underline">
            Forgot password?
          </a>
        </div>

        {errors.root && <p className="text-sm text-danger-600">{errors.root.message}</p>}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign In
        </Button>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Demo accounts — Admin: <span className="font-mono">admin@condotel.com / admin123</span>{' '}
          &middot; Staff: <span className="font-mono">staff@condotel.com / staff123</span>
        </div>

        <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          or
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button type="button" variant="secondary" className="w-full" disabled title="Wired once Google OAuth is added in Phase 1 backend work">
          Continue with Google
        </Button>

        <p className="pt-2 text-center text-sm text-slate-500">
          New here? <a href="#" className="font-medium text-brand-500 hover:underline">Contact administrator</a>
        </p>
      </form>
    </AuthLayout>
  )
}
