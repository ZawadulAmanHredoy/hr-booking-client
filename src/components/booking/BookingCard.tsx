import { Link } from 'react-router-dom'
import { CalendarDays, Clock, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from './BookingStatusBadge'
import type { Booking } from '@/services/api/bookings'
import { MEETING_PROVIDER_LABELS } from '@/lib/constants'
import { formatDate, formatTime } from '@/lib/datetime'
import { formatMoney } from '@/lib/format'

interface BookingCardProps {
  booking: Booking
  timezone: string
  perspective: 'client' | 'consultant'
}

export function BookingCard({ booking, timezone, perspective }: BookingCardProps) {
  const counterpart = perspective === 'client' ? booking.consultant : booking.client
  const counterpartName = counterpart
    ? `${counterpart.firstName} ${counterpart.lastName}`
    : 'Unknown participant'

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{counterpartName}</span>
          <BookingStatusBadge status={booking.status} />
        </div>
        {booking.profile?.headline && (
          <p className="text-sm text-muted-foreground">{booking.profile.headline}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(booking.startAt, timezone)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(booking.startAt, timezone)} – {formatTime(booking.endAt, timezone)}
          </span>
          <span className="flex items-center gap-1.5">
            <User2 className="h-3.5 w-3.5" />
            {MEETING_PROVIDER_LABELS[booking.meetingProvider]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <span className="text-sm font-semibold">
          {formatMoney(booking.priceCents, booking.currency)}
        </span>
        <Button asChild variant="outline" size="sm">
          <Link to={`/dashboard/bookings/${booking.id}`}>View details</Link>
        </Button>
      </div>
    </div>
  )
}
