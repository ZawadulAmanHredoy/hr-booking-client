import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FormAlert } from '@/components/auth/FormAlert'
import { getProfileSlots, type Slot } from '@/services/api/availability'
import { BOOKING_LIMITS } from '@/lib/constants'
import { addDays, formatTime, groupByDay, startOfToday, timezoneAbbreviation } from '@/lib/datetime'
import { cn } from '@/lib/utils'

interface SlotPickerProps {
  profileId: string
  timezone: string
  selected?: string
  onSelect: (slot: Slot) => void
  excludeStartAt?: string
}

export function SlotPicker({
  profileId,
  timezone,
  selected,
  onSelect,
  excludeStartAt,
}: SlotPickerProps) {
  const [windowStart, setWindowStart] = useState(() => startOfToday())
  const [activeDay, setActiveDay] = useState<string | null>(null)

  const windowEnd = addDays(windowStart, BOOKING_LIMITS.SLOT_WINDOW_DAYS)
  const from = windowStart.toISOString()
  const to = windowEnd.toISOString()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['slots', profileId, from, to],
    queryFn: () => getProfileSlots(profileId, { from, to }),
    enabled: profileId.length > 0,
  })

  const groups = useMemo(() => {
    const slots = (data?.slots ?? []).filter((slot) => slot.startAt !== excludeStartAt)
    return groupByDay(slots, timezone)
  }, [data, timezone, excludeStartAt])

  const active = groups.find((group) => group.dateKey === activeDay) ?? groups[0]
  const isFirstWindow = windowStart.getTime() <= startOfToday().getTime()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Times shown in your timezone · {timezone} ({timezoneAbbreviation(timezone)})
        </p>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Earlier dates"
            disabled={isFirstWindow}
            onClick={() => {
              setActiveDay(null)
              setWindowStart((current) =>
                maxDate(addDays(current, -BOOKING_LIMITS.SLOT_WINDOW_DAYS), startOfToday()),
              )
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Later dates"
            onClick={() => {
              setActiveDay(null)
              setWindowStart((current) => addDays(current, BOOKING_LIMITS.SLOT_WINDOW_DAYS))
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <FormAlert variant="error">
          {error instanceof Error ? error.message : 'Could not load available times.'}
        </FormAlert>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
          <CalendarX2 className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No open times in this period. Try a later date range.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {groups.map((group) => (
              <button
                key={group.dateKey}
                type="button"
                onClick={() => setActiveDay(group.dateKey)}
                className={cn(
                  'shrink-0 rounded-md border px-3 py-2 text-sm transition-colors',
                  group.dateKey === active?.dateKey
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-accent',
                )}
              >
                <span className="block font-medium">{group.heading}</span>
                <span className="block text-xs opacity-80">
                  {group.items.length} {group.items.length === 1 ? 'slot' : 'slots'}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {active?.items.map((slot) => (
              <Button
                key={slot.startAt}
                type="button"
                variant={slot.startAt === selected ? 'default' : 'outline'}
                onClick={() => onSelect(slot)}
              >
                {formatTime(slot.startAt, timezone)}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function maxDate(a: Date, b: Date): Date {
  return a > b ? a : b
}
