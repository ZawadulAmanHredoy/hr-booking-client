import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormAlert } from '@/components/auth/FormAlert'
import { SlotPicker } from './SlotPicker'
import { createBooking } from '@/services/api/bookings'
import type { Slot } from '@/services/api/availability'
import type { HRProfile } from '@/services/api/hrProfiles'
import { useAuthStore } from '@/stores/auth'
import {
  BOOKING_LIMITS,
  MEETING_PROVIDERS,
  MEETING_PROVIDER_LABELS,
  type MeetingProvider,
} from '@/lib/constants'
import { browserTimezone, formatDateTime } from '@/lib/datetime'
import { formatMoney } from '@/lib/format'

export function BookingPanel({ profile }: { profile: HRProfile }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [timezone] = useState(browserTimezone)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [notes, setNotes] = useState('')
  const [provider, setProvider] = useState<MeetingProvider>('GOOGLE_MEET')

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        profileId: profile.id,
        startAt: slot!.startAt,
        timezone,
        notes: notes.trim() ? notes.trim() : undefined,
        meetingProvider: provider,
      }),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: ['slots', profile.id] })
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      navigate(`/dashboard/bookings/${booking.id}`)
    },
  })

  if (!profile.isAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Book a consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This consultant is not accepting new consultations right now.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Book a consultation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Log in to see live availability and reserve a time.
          </p>
          <Button asChild>
            <Link to="/login" state={{ from: location.pathname }}>
              Log in to book
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (profile.user?.id === user.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Book a consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is your own profile. Manage your working hours from{' '}
            <Link to="/profile/availability" className="font-medium underline">
              availability settings
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    )
  }

  const durationMinutes = slot
    ? Math.round((new Date(slot.endAt).getTime() - new Date(slot.startAt).getTime()) / 60_000)
    : 0
  const priceCents = Math.round((profile.hourlyRateCents * durationMinutes) / 60)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Book a consultation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {mutation.isError && (
          <FormAlert variant="error">
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'Could not confirm this booking.'}
          </FormAlert>
        )}

        <SlotPicker
          profileId={profile.id}
          timezone={timezone}
          selected={slot?.startAt}
          onSelect={setSlot}
        />

        {slot && (
          <div className="flex flex-col gap-4 border-t pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-4 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <CalendarCheck className="h-4 w-4 text-primary" />
                {formatDateTime(slot.startAt, timezone)}
              </span>
              <span className="text-muted-foreground">
                {durationMinutes} min · {formatMoney(priceCents, profile.currency)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="meetingProvider">Meeting platform</Label>
              <Select
                id="meetingProvider"
                value={provider}
                onChange={(event) => setProvider(event.target.value as MeetingProvider)}
              >
                {MEETING_PROVIDERS.map((value) => (
                  <option key={value} value={value}>
                    {MEETING_PROVIDER_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">What would you like to discuss? (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                maxLength={BOOKING_LIMITS.NOTES_MAX}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Share context so your consultant can prepare."
              />
            </div>

            <Button
              size="lg"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="sm:w-auto"
            >
              {mutation.isPending ? 'Confirming…' : 'Confirm booking'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
