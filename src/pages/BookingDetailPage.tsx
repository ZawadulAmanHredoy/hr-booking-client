import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { FormAlert } from '@/components/auth/FormAlert'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { cancelBooking, getBooking, rescheduleBooking, retryMeeting } from '@/services/api/bookings'
import type { Booking } from '@/services/api/bookings'
import { useAuthStore } from '@/stores/auth'
import { BOOKING_LIMITS, MEETING_PROVIDER_LABELS } from '@/lib/constants'
import { browserTimezone, formatDateTime, isPast, timezoneAbbreviation } from '@/lib/datetime'
import { formatMoney } from '@/lib/format'

export function BookingDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [timezone] = useState(browserTimezone)
  const [mode, setMode] = useState<'view' | 'cancel' | 'reschedule'>('view')
  const [reason, setReason] = useState('')
  const [nextStartAt, setNextStartAt] = useState<string | null>(null)

  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id),
    enabled: id.length > 0,
  })

  function onChanged(updated: Booking) {
    queryClient.setQueryData(['booking', id], updated)
    void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    if (updated.profile?.id) {
      void queryClient.invalidateQueries({ queryKey: ['slots', updated.profile.id] })
    }
    setMode('view')
    setNextStartAt(null)
    setReason('')
  }

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id, reason.trim() ? reason.trim() : undefined),
    onSuccess: onChanged,
  })

  const rescheduleMutation = useMutation({
    mutationFn: () => rescheduleBooking(id, nextStartAt!, timezone),
    onSuccess: onChanged,
  })

  const retryMutation = useMutation({
    mutationFn: () => retryMeeting(id),
    onSuccess: (updated) => queryClient.setQueryData(['booking', id], updated),
  })

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 flex flex-col gap-4 rounded-lg border p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    )
  }

  if (isError || !booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <BackLink />
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Booking not found.'}
        </FormAlert>
      </section>
    )
  }

  const isConsultant = booking.consultant?.id === user?.id
  const counterpart = isConsultant ? booking.client : booking.consultant
  const isActive = booking.status === 'CONFIRMED' || booking.status === 'PENDING'
  const canChange = isActive && !isPast(booking.startAt)
  const mutationError = cancelMutation.error ?? rescheduleMutation.error ?? retryMutation.error

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <BackLink />

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl">
              {counterpart ? `${counterpart.firstName} ${counterpart.lastName}` : 'HR consultation'}
            </CardTitle>
            {booking.profile?.headline && (
              <p className="text-muted-foreground">{booking.profile.headline}</p>
            )}
          </div>
          <BookingStatusBadge status={booking.status} />
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {mutationError instanceof Error && (
            <FormAlert variant="error">{mutationError.message}</FormAlert>
          )}

          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="When">
              {formatDateTime(booking.startAt, timezone)}
              <span className="block text-xs text-muted-foreground">
                {timezone} ({timezoneAbbreviation(timezone)})
              </span>
            </Detail>
            <Detail label="Consultant's local time">
              {formatDateTime(booking.startAt, booking.hrTimezone)}
              <span className="block text-xs text-muted-foreground">
                {booking.hrTimezone} ({timezoneAbbreviation(booking.hrTimezone)})
              </span>
            </Detail>
            <Detail label="Duration">{booking.durationMinutes} minutes</Detail>
            <Detail label="Fee">{formatMoney(booking.priceCents, booking.currency)}</Detail>
            <Detail label="Meeting platform">
              {MEETING_PROVIDER_LABELS[booking.meetingProvider]}
            </Detail>
            <Detail label="Booking reference">
              <span className="font-mono text-sm">{booking.id}</span>
            </Detail>
          </dl>

          {isActive && (
            <MeetingSection
              booking={booking}
              onRetry={() => retryMutation.mutate()}
              isRetrying={retryMutation.isPending}
            />
          )}

          {canChange && (
            <p className="text-sm text-muted-foreground">
              📧 You'll receive a reminder email 30 minutes before this consultation.
            </p>
          )}

          {booking.notes && (
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">Notes from the client</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          )}

          {booking.previousStartAt && (
            <p className="text-sm text-muted-foreground">
              Moved from {formatDateTime(booking.previousStartAt, timezone)} · rescheduled{' '}
              {booking.rescheduleCount}×
            </p>
          )}

          {booking.status === 'CANCELLED' && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              Cancelled by {booking.cancelledBy?.toLowerCase()}
              {booking.cancelledAt ? ` on ${formatDateTime(booking.cancelledAt, timezone)}` : ''}
              {booking.cancellationReason ? ` — ${booking.cancellationReason}` : ''}
            </div>
          )}

          {canChange && mode === 'view' && (
            <div className="flex flex-wrap gap-3 border-t pt-5">
              <Button variant="outline" onClick={() => setMode('reschedule')}>
                Reschedule
              </Button>
              <Button variant="outline" onClick={() => setMode('cancel')}>
                Cancel booking
              </Button>
            </div>
          )}

          {mode === 'cancel' && (
            <div className="flex flex-col gap-3 border-t pt-5">
              <Label htmlFor="reason">Why are you cancelling? (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                maxLength={BOOKING_LIMITS.CANCEL_REASON_MAX}
                onChange={(event) => setReason(event.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Clients must cancel at least {BOOKING_LIMITS.CANCEL_NOTICE_MINUTES} minutes before
                the consultation starts.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="destructive"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate()}
                >
                  {cancelMutation.isPending ? 'Cancelling…' : 'Confirm cancellation'}
                </Button>
                <Button variant="ghost" onClick={() => setMode('view')}>
                  Keep booking
                </Button>
              </div>
            </div>
          )}

          {mode === 'reschedule' && booking.profile?.id && (
            <div className="flex flex-col gap-4 border-t pt-5">
              <h2 className="text-sm font-semibold">Pick a new time</h2>
              <SlotPicker
                profileId={booking.profile.id}
                timezone={timezone}
                selected={nextStartAt ?? undefined}
                excludeStartAt={booking.startAt}
                onSelect={(slot) => setNextStartAt(slot.startAt)}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={!nextStartAt || rescheduleMutation.isPending}
                  onClick={() => rescheduleMutation.mutate()}
                >
                  {rescheduleMutation.isPending ? 'Moving…' : 'Confirm new time'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMode('view')
                    setNextStartAt(null)
                  }}
                >
                  Keep current time
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function BackLink() {
  return (
    <Button asChild variant="ghost" size="sm" className="mb-6">
      <Link to="/dashboard/bookings">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>
    </Button>
  )
}

function MeetingSection({
  booking,
  onRetry,
  isRetrying,
}: {
  booking: Booking
  onRetry: () => void
  isRetrying: boolean
}) {
  const { meeting } = booking

  if (meeting.status === 'CREATED' && meeting.meetingUrl) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-600/30 bg-emerald-50 p-4">
        <div className="flex flex-col">
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <Video className="h-4 w-4" />
            {MEETING_PROVIDER_LABELS[meeting.provider]} link is ready
          </span>
          <span className="text-xs text-emerald-700">The invite is also in your calendar.</span>
        </div>
        <Button asChild>
          <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
            Join meeting
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted p-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium">Meeting link not created yet</span>
        <span className="text-xs text-muted-foreground">
          {meeting.lastError ?? 'The consultant still needs to connect their calendar.'}
        </span>
      </div>
      {booking.canRetryMeeting && (
        <Button variant="outline" disabled={isRetrying} onClick={onRetry}>
          {isRetrying ? 'Creating…' : 'Create link now'}
        </Button>
      )}
    </div>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}
