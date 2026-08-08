import { create } from 'zustand'
import { setSessionExpiredHandler } from '@/services/api/client'
import * as authApi from '@/services/api/auth'
import type { LoginInput, PublicUser, RegisterInput } from '@/services/api/auth'

interface AuthState {
  user: PublicUser | null
  isInitialized: boolean
  setUser: (user: PublicUser) => void
  clearSession: () => void
  login: (input: LoginInput) => Promise<PublicUser>
  register: (input: RegisterInput) => Promise<PublicUser>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  setUser: (user) => set({ user, isInitialized: true }),

  clearSession: () => set({ user: null, isInitialized: true }),

  login: async (input) => {
    const data = await authApi.login(input)
    set({ user: data.user, isInitialized: true })
    return data.user
  },

  register: async (input) => {
    const data = await authApi.register(input)
    set({ user: data.user, isInitialized: true })
    return data.user
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null, isInitialized: true })
    }
  },
}))

setSessionExpiredHandler(() => {
  useAuthStore.getState().clearSession()
})
