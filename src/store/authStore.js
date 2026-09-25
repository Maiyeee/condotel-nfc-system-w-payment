import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROLES } from '@/lib/constants'

// TEMPORARY mock users so the auth flow, protected routes, and
// role-based sidebar can be built/tested before the backend (Phase
// 7 in the plan) exists. Replace `login()` below with a real
// `apiClient.post('/auth/login', ...)` call once that API is live —
// nothing else in the app should need to change, since components
// only ever talk to this store.
const MOCK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@condotel.com', password: 'admin123', role: ROLES.ADMIN },
  { id: 2, name: 'Front Desk Staff', email: 'staff@condotel.com', password: 'staff123', role: ROLES.STAFF },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        await new Promise((r) => setTimeout(r, 500)) // simulate network

        const match = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )

        if (!match) {
          set({ isLoading: false, error: 'Invalid email or password.' })
          return false
        }

        // eslint-disable-next-line no-unused-vars
        const { password: _pw, ...user } = match
        set({
          user,
          token: `mock-token-${user.id}`,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
        return true
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      clearError: () => set({ error: null }),

      hasRole: (...roles) => roles.includes(get().user?.role),
    }),
    {
      name: 'condotel-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
