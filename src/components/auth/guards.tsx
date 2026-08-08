import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface AuthGuardProps {
  children: ReactNode
}

export function RequireAuth({ children }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export function RedirectIfAuthed({ children }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
