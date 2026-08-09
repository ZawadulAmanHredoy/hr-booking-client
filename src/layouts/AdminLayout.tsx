import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/hr', label: 'HR applications' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/specializations', label: 'Specializations' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/audit-logs', label: 'Audit logs' },
  { to: '/admin/settings', label: 'Settings' },
]

export function AdminLayout() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Platform oversight and moderation.</p>
      </div>

      <nav className="mb-8 flex flex-wrap gap-1 border-b">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'rounded-t-md border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'border-primary text-foreground',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </section>
  )
}
