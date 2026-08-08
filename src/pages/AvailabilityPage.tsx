import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import {
  getMyAvailability,
  updateMyAvailability,
  type Availability,
  type BlockedDate,
  type WorkingDay,
} from '@/services/api/availability'
import { COMMON_TIMEZONES, SLOT_DURATIONS, WEEKDAYS } from '@/lib/constants'
import { browserTimezone, timezoneAbbreviation } from '@/lib/datetime'

const DEFAULT_INTERVAL = { start: '09:00', end: '17:00' }

interface DraftState {
  timezone: string
  slotDurationMinutes: number
  bufferMinutes: number
  minNoticeMinutes: number
  maxAdvanceDays: number
  weeklyHours: WorkingDay[]
  blockedDates: BlockedDate[]
}

function toDraft(availability: Availability): DraftState {
  return {
    timezone: availability.timezone,
    slotDurationMinutes: availability.slotDurationMinutes,
    bufferMinutes: availability.bufferMinutes,
    minNoticeMinutes: availability.minNoticeMinutes,
    maxAdvanceDays: availability.maxAdvanceDays,
    weeklyHours: availability.weeklyHours.map((day) => ({
      weekday: day.weekday,
      intervals: day.intervals.map((interval) => ({ ...interval })),
    })),
    blockedDates: availability.blockedDates.map((block) => ({ ...block })),
  }
}

export function AvailabilityPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-availability'],
    queryFn: getMyAvailability,
  })

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-9 w-64" />
        <div className="mt-6 flex flex-col gap-4 rounded-lg border p-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <FormAlert variant="error">Could not load your availability. Please try again.</FormAlert>
      </section>
    )
  }

  return <AvailabilityEditor availability={data} />
}

function AvailabilityEditor({ availability }: { availability: Availability }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<DraftState>(() => toDraft(availability))
  const [saved, setSaved] = useState(false)

  const mutation = useMutation({
    mutationFn: (input: DraftState) => updateMyAvailability(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-availability'], updated)
      setDraft(toDraft(updated))
      setSaved(true)
    },
  })

  const timezoneOptions = useMemo(() => {
    const values = new Set<string>([...COMMON_TIMEZONES, browserTimezone(), draft.timezone])
    return [...values].sort()
  }, [draft.timezone])

  function update(patch: Partial<DraftState>) {
    setSaved(false)
    setDraft((current) => ({ ...current, ...patch }))
  }

  function toggleDay(weekday: number, enabled: boolean) {
    const rest = draft.weeklyHours.filter((day) => day.weekday !== weekday)
    update({
      weeklyHours: enabled
        ? [...rest, { weekday, intervals: [{ ...DEFAULT_INTERVAL }] }].sort(
            (a, b) => a.weekday - b.weekday,
          )
        : rest,
    })
  }

  function updateInterval(weekday: number, index: number, field: 'start' | 'end', value: string) {
    update({
      weeklyHours: draft.weeklyHours.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              intervals: day.intervals.map((interval, i) =>
                i === index ? { ...interval, [field]: value } : interval,
              ),
            }
          : day,
      ),
    })
  }

  function addInterval(weekday: number) {
    update({
      weeklyHours: draft.weeklyHours.map((day) =>
        day.weekday === weekday
          ? { ...day, intervals: [...day.intervals, { start: '18:00', end: '20:00' }] }
          : day,
      ),
    })
  }

  function removeInterval(weekday: number, index: number) {
    update({
      weeklyHours: draft.weeklyHours.map((day) =>
        day.weekday === weekday
          ? { ...day, intervals: day.intervals.filter((_, i) => i !== index) }
          : day,
      ),
    })
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Clients only ever see open slots generated from these hours.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {mutation.isError && (
          <FormAlert variant="error">
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'Could not save your availability.'}
          </FormAlert>
        )}
        {saved && <FormAlert variant="success">Availability saved.</FormAlert>}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Booking rules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                id="timezone"
                value={draft.timezone}
                onChange={(event) => update({ timezone: event.target.value })}
              >
                {timezoneOptions.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone} ({timezoneAbbreviation(zone)})
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="slotDuration">Consultation length</Label>
              <Select
                id="slotDuration"
                value={draft.slotDurationMinutes}
                onChange={(event) => update({ slotDurationMinutes: Number(event.target.value) })}
              >
                {SLOT_DURATIONS.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} minutes
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="buffer">Break between consultations (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                min={0}
                max={60}
                value={draft.bufferMinutes}
                onChange={(event) => update({ bufferMinutes: Number(event.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notice">Minimum notice (minutes)</Label>
              <Input
                id="notice"
                type="number"
                min={0}
                value={draft.minNoticeMinutes}
                onChange={(event) => update({ minNoticeMinutes: Number(event.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="horizon">How far ahead clients can book (days)</Label>
              <Input
                id="horizon"
                type="number"
                min={1}
                max={180}
                value={draft.maxAdvanceDays}
                onChange={(event) => update({ maxAdvanceDays: Number(event.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Weekly hours</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {WEEKDAYS.map((weekday) => {
              const day = draft.weeklyHours.find((entry) => entry.weekday === weekday.value)
              return (
                <div
                  key={weekday.value}
                  className="flex flex-col gap-2 border-b pb-4 last:border-0"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={Boolean(day)}
                      onChange={(event) => toggleDay(weekday.value, event.target.checked)}
                    />
                    <span className="font-medium">{weekday.label}</span>
                    {!day && <span className="text-sm text-muted-foreground">Unavailable</span>}
                  </label>

                  {day?.intervals.map((interval, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2 pl-7">
                      <Input
                        type="time"
                        className="w-32"
                        value={interval.start}
                        aria-label={`${weekday.label} start time`}
                        onChange={(event) =>
                          updateInterval(weekday.value, index, 'start', event.target.value)
                        }
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        className="w-32"
                        value={interval.end}
                        aria-label={`${weekday.label} end time`}
                        onChange={(event) =>
                          updateInterval(weekday.value, index, 'end', event.target.value)
                        }
                      />
                      {day.intervals.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remove interval"
                          onClick={() => removeInterval(weekday.value, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {day && day.intervals.length < 4 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-7 self-start"
                      onClick={() => addInterval(weekday.value)}
                    >
                      <Plus className="h-4 w-4" /> Add another block
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Blocked dates</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {draft.blockedDates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No blocked dates. Add one to close a full day for holidays or leave.
              </p>
            )}

            {draft.blockedDates.map((block, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  className="w-44"
                  value={block.date}
                  aria-label="Blocked date"
                  onChange={(event) =>
                    update({
                      blockedDates: draft.blockedDates.map((entry, i) =>
                        i === index ? { ...entry, date: event.target.value } : entry,
                      ),
                    })
                  }
                />
                <Input
                  className="flex-1 min-w-40"
                  placeholder="Reason (optional)"
                  value={block.reason ?? ''}
                  aria-label="Reason"
                  onChange={(event) =>
                    update({
                      blockedDates: draft.blockedDates.map((entry, i) =>
                        i === index ? { ...entry, reason: event.target.value } : entry,
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove blocked date"
                  onClick={() =>
                    update({ blockedDates: draft.blockedDates.filter((_, i) => i !== index) })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() =>
                update({
                  blockedDates: [
                    ...draft.blockedDates,
                    { date: new Date().toISOString().slice(0, 10) },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" /> Block a date
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            size="lg"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(normalize(draft))}
          >
            {mutation.isPending ? 'Saving…' : 'Save availability'}
          </Button>
        </div>
      </div>
    </section>
  )
}

/** Drops empty reasons so the API never stores blank strings. */
function normalize(draft: DraftState): DraftState {
  return {
    ...draft,
    blockedDates: draft.blockedDates.map((block) => ({
      date: block.date,
      startTime: block.startTime,
      endTime: block.endTime,
      reason: block.reason?.trim() ? block.reason.trim() : undefined,
    })),
  }
}
