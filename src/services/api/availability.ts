import { apiClient, getApiErrorMessage } from './client'

export interface WorkingInterval {
  start: string
  end: string
}

export interface WorkingDay {
  weekday: number
  intervals: WorkingInterval[]
}

export interface BlockedDate {
  date: string
  startTime?: string
  endTime?: string
  reason?: string
}

export interface Availability {
  timezone: string
  slotDurationMinutes: number
  bufferMinutes: number
  minNoticeMinutes: number
  maxAdvanceDays: number
  weeklyHours: WorkingDay[]
  blockedDates: BlockedDate[]
  updatedAt: string
}

export type UpdateAvailabilityInput = Omit<Availability, 'updatedAt'>

export interface PublicSchedule {
  timezone: string
  slotDurationMinutes: number
  minNoticeMinutes: number
  maxAdvanceDays: number
  weeklyHours: WorkingDay[]
}

export interface Slot {
  startAt: string
  endAt: string
}

export interface SlotsResult {
  schedule: PublicSchedule
  from: string
  to: string
  timezone: string
  slotDurationMinutes: number
  slots: Slot[]
}

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

export async function getMyAvailability(): Promise<Availability> {
  try {
    const res = await apiClient.get<{ success: true; data: { availability: Availability } }>(
      '/availability/me',
    )
    return res.data.data.availability
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load your availability.'), error)
  }
}

export async function updateMyAvailability(input: UpdateAvailabilityInput): Promise<Availability> {
  try {
    const res = await apiClient.put<{ success: true; data: { availability: Availability } }>(
      '/availability/me',
      input,
    )
    return res.data.data.availability
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not save your availability.'), error)
  }
}

export async function getProfileSlots(
  profileId: string,
  range: { from: string; to: string },
): Promise<SlotsResult> {
  try {
    const res = await apiClient.get<{ success: true; data: SlotsResult }>(
      `/availability/${profileId}/slots`,
      { params: range },
    )
    return res.data.data
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load available times.'), error)
  }
}
