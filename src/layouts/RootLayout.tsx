import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/hr', label: 'HR Professionals' },
  { to: '/about', label: 'About' },
]

export function RootLayout() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    setMobileNavOpen(false)
    void logout().then(() => navigate('/'))
  }

  const authActions = user ? (
    <>
      <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
        {user.firstName}
      </span>
      <Button asChild variant="ghost" size="sm">
        <Link to="/dashboard">Dashboard</Link>
      </Button>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Log out
      </Button>
    </>
  ) : (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link to="/login">Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link to="/register">Sign up</Link>
      </Button>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold"
            onClick={() => setMobileNavOpen(false)}
          >
            <CalendarCheck className="h-5 w-5 text-primary" />
            <span>HR Booking</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">{authActions}</div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileNavOpen && (
          <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      isActive && 'text-foreground',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                {user ? (
                  <>
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link to="/dashboard" onClick={() => setMobileNavOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link to="/register" onClick={() => setMobileNavOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} HR Booking. All rights reserved.</p>
          <p>Consultations over Google Meet &amp; Zoom.</p>
        </div>
      </footer>
    </div>
  )
}
