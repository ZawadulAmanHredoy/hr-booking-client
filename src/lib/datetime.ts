export function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function isSupportedTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/** `YYYY-MM-DD` for an instant as seen in the given zone. */
export function dateKeyIn(value: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(toDate(value))
}

export function formatTime(value: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(toDate(value))
}

export function formatDate(value: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(toDate(value))
}

export function formatDateTime(value: string | Date, timezone: string): string {
  return `${formatDate(value, timezone)} · ${formatTime(value, timezone)}`
}

export function formatDayHeading(value: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(toDate(value))
}

/** Short zone label such as `GMT+6`, used to make displayed times unambiguous. */
export function timezoneAbbreviation(timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  }).formatToParts(new Date())

  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timezone
}

export function isPast(value: string | Date): boolean {
  return toDate(value).getTime() < Date.now()
}

export function minutesUntil(value: string | Date): number {
  return Math.round((toDate(value).getTime() - Date.now()) / 60_000)
}

export function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000)
}

export function startOfToday(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

export interface SlotGroup<T> {
  dateKey: string
  heading: string
  items: T[]
}

/** Group instants into calendar days as the viewer's timezone sees them. */
export function groupByDay<T extends { startAt: string }>(
  items: T[],
  timezone: string,
): SlotGroup<T>[] {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const key = dateKeyIn(item.startAt, timezone)
    const bucket = groups.get(key)
    if (bucket) {
      bucket.push(item)
    } else {
      groups.set(key, [item])
    }
  }

  return [...groups.entries()].map(([dateKey, groupItems]) => ({
    dateKey,
    heading: formatDayHeading(groupItems[0].startAt, timezone),
    items: groupItems,
  }))
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}
