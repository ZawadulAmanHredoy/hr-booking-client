import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarRange } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { BookingCard } from '@/components/booking/BookingCard'
import { listBookings } from '@/services/api/bookings'
import { useAuthStore } from '@/stores/auth'
import { browserTimezone } from '@/lib/datetime'
import { cn } from '@/lib/utils'

type Scope = 'upcoming' | 'past'

const scopes: { value: Scope; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past & cancelled' },
]

export function BookingsPage() {
  const user = useAuthStore((s) => s.user)
  const isConsultant = user?.role === 'HR'

  const [scope, setScope] = useState<Scope>('upcoming')
  const [asConsultant, setAsConsultant] = useState(isConsultant)
  const [timezone] = useState(browserTimezone)

  const role = asConsultant ? 'hr' : 'user'

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', role, scope],
    queryFn: () => listBookings({ role, scope, limit: 50 }),
  })

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {asConsultant ? 'Consultations with you' : 'My bookings'}
        </h1>
        <p className="text-muted-foreground">All times are shown in your timezone ({timezone}).</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-md border p-1">
          {scopes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setScope(item.value)}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                scope === item.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isConsultant && (
          <Button variant="outline" size="sm" onClick={() => setAsConsultant((value) => !value)}>
            {asConsultant ? 'Show bookings I made' : 'Show bookings with me'}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load your bookings.'}
        </FormAlert>
      ) : data && data.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.data.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              timezone={timezone}
              perspective={asConsultant ? 'consultant' : 'client'}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <CalendarRange className="h-7 w-7 text-muted-foreground" />
          <p className="text-muted-foreground">
            {scope === 'upcoming'
              ? 'Nothing on the calendar yet.'
              : 'No past consultations to show.'}
          </p>
          {!asConsultant && scope === 'upcoming' && (
            <Button asChild>
              <Link to="/hr">Find a consultant</Link>
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
