import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarClock, CalendarRange, Clock3, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { BookingCard } from '@/components/booking/BookingCard'
import { listBookings } from '@/services/api/bookings'
import { useAuthStore } from '@/stores/auth'
import { browserTimezone, formatDateTime, minutesUntil } from '@/lib/datetime'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isConsultant = user?.role === 'HR'
  const [timezone] = useState(browserTimezone)
  const role = isConsultant ? 'hr' : 'user'

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', role, 'upcoming'],
    queryFn: () => listBookings({ role, scope: 'upcoming', limit: 5 }),
  })

  const next = data?.data[0]

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-muted-foreground">
          {isConsultant
            ? 'Your upcoming consultations and scheduling settings.'
            : 'Your upcoming consultations at a glance.'}
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <QuickLink
          to="/dashboard/bookings"
          icon={<CalendarRange className="h-5 w-5 text-primary" />}
          title="Bookings"
          description="View, reschedule or cancel."
        />
        {isConsultant ? (
          <>
            <QuickLink
              to="/profile/availability"
              icon={<Clock3 className="h-5 w-5 text-primary" />}
              title="Availability"
              description="Set the hours clients can book."
            />
            <QuickLink
              to="/profile/manage"
              icon={<Settings2 className="h-5 w-5 text-primary" />}
              title="Profile"
              description="Publish and edit your profile."
            />
          </>
        ) : (
          <>
            <QuickLink
              to="/hr"
              icon={<CalendarClock className="h-5 w-5 text-primary" />}
              title="Find a consultant"
              description="Browse the HR directory."
            />
            <QuickLink
              to="/profile"
              icon={<Settings2 className="h-5 w-5 text-primary" />}
              title="Become a consultant"
              description="Create your HR profile."
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Next up</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : isError ? (
            <FormAlert variant="error">
              {error instanceof Error ? error.message : 'Could not load your bookings.'}
            </FormAlert>
          ) : next ? (
            <>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(next.startAt, timezone)} · in {formatLead(next.startAt)}
              </p>
              {data?.data.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  timezone={timezone}
                  perspective={isConsultant ? 'consultant' : 'client'}
                />
              ))}
            </>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-muted-foreground">No upcoming consultations.</p>
              {!isConsultant && (
                <Button asChild>
                  <Link to="/hr">Book a consultation</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function QuickLink({
  to,
  icon,
  title,
  description,
}: {
  to: string
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      {icon}
      <span className="font-medium">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </Link>
  )
}

function formatLead(startAt: string): string {
  const minutes = minutesUntil(startAt)
  if (minutes < 60) {
    return `${minutes} min`
  }
  if (minutes < 60 * 24) {
    return `${Math.round(minutes / 60)} h`
  }
  return `${Math.round(minutes / (60 * 24))} days`
}
