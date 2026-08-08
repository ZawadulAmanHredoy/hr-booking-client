import { apiClient, getApiErrorMessage } from './client'
import type { BookingStatus, Currency, MeetingProvider, MeetingStatus } from '@/lib/constants'
import type { Pagination } from './hrProfiles'

export interface BookingParticipant {
  id: string
  firstName: string
  lastName: string
}

export interface BookingMeeting {
  provider: MeetingProvider
  status: MeetingStatus
  meetingUrl?: string
  startTime?: string
  endTime?: string
  lastError?: string
  attempts?: number
}

export interface Booking {
  id: string
  startAt: string
  endAt: string
  durationMinutes: number
  status: BookingStatus
  hrTimezone: string
  userTimezone: string
  priceCents: number
  currency: Currency
  meetingProvider: MeetingProvider
  notes?: string
  cancelledAt?: string
  cancelledBy?: 'USER' | 'HR' | 'ADMIN' | 'SYSTEM'
  cancellationReason?: string
  previousStartAt?: string
  rescheduleCount: number
  client?: BookingParticipant
  consultant?: BookingParticipant
  profile?: { id: string; headline: string }
  meeting: BookingMeeting
  canRetryMeeting: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBookingInput {
  profileId: string
  startAt: string
  timezone?: string
  notes?: string
  meetingProvider?: MeetingProvider
}

export interface ListBookingsParams {
  page?: number
  limit?: number
  role?: 'user' | 'hr'
  scope?: 'upcoming' | 'past' | 'all'
  status?: BookingStatus
}

export interface ListBookingsResult {
  data: Booking[]
  pagination: Pagination
}

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  try {
    const res = await apiClient.post<{ success: true; data: { booking: Booking } }>(
      '/bookings',
      input,
    )
    return res.data.data.booking
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not confirm this booking.'), error)
  }
}

export async function listBookings(params: ListBookingsParams = {}): Promise<ListBookingsResult> {
  try {
    const res = await apiClient.get<{
      success: true
      data: Booking[]
      pagination: Pagination
    }>('/bookings', { params })
    return { data: res.data.data, pagination: res.data.pagination }
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load your bookings.'), error)
  }
}

export async function getBooking(id: string): Promise<Booking> {
  try {
    const res = await apiClient.get<{ success: true; data: { booking: Booking } }>(
      `/bookings/${id}`,
    )
    return res.data.data.booking
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Booking not found.'), error)
  }
}

export async function cancelBooking(id: string, reason?: string): Promise<Booking> {
  try {
    const res = await apiClient.patch<{ success: true; data: { booking: Booking } }>(
      `/bookings/${id}/cancel`,
      reason ? { reason } : {},
    )
    return res.data.data.booking
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not cancel this booking.'), error)
  }
}

export async function retryMeeting(id: string): Promise<Booking> {
  try {
    const res = await apiClient.post<{ success: true; data: { booking: Booking } }>(
      `/bookings/${id}/meeting/retry`,
    )
    return res.data.data.booking
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not create the meeting link.'), error)
  }
}

export async function rescheduleBooking(
  id: string,
  startAt: string,
  timezone?: string,
): Promise<Booking> {
  try {
    const res = await apiClient.patch<{ success: true; data: { booking: Booking } }>(
      `/bookings/${id}/reschedule`,
      { startAt, timezone },
    )
    return res.data.data.booking
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not move this booking.'), error)
  }
}
