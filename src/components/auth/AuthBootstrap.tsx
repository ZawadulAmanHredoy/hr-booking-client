import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth'
import { getMe } from '@/services/api/auth'

interface AuthBootstrapProps {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const setUser = useAuthStore((s) => s.setUser)
  const clearSession = useAuthStore((s) => s.clearSession)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  useEffect(() => {
    let active = true
    getMe()
      .then((user) => {
        if (active) setUser(user)
      })
      .catch(() => {
        if (active) clearSession()
      })
    return () => {
      active = false
    }
  }, [setUser, clearSession])

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return children
}
