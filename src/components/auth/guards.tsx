import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/services/api/auth'

interface AuthGuardProps {
  children: ReactNode
}

interface RoleGuardProps extends AuthGuardProps {
  roles: UserRole[]
}

export function RequireAuth({ children }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export function RequireRole({ roles, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" state={{ from: location.pathname }} replace />
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
