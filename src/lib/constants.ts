// Specialization slugs are admin-managed and fetched from the API (see
// `services/api/specializations.ts` / `hooks/useSpecializations.ts`) rather than hardcoded here.
export type Specialization = string

export const PROFILE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
} as const

export type ProfileStatus = (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS]

export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending review',
  PUBLISHED: 'Published',
  REJECTED: 'Changes needed',
}

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'CAD', 'AUD'] as const

export type Currency = (typeof CURRENCIES)[number]

export const PROFILE_LIMITS = {
  SPECIALIZATIONS_MIN: 1,
  SPECIALIZATIONS_MAX: 5,
  LANGUAGES_MIN: 1,
  LANGUAGES_MAX: 5,
  CERTIFICATIONS_MAX: 10,
  WORK_HISTORY_MAX: 10,
  RATE_MIN_CENTS: 500,
  RATE_MAX_CENTS: 100_000,
  YEARS_MIN: 0,
  YEARS_MAX: 70,
} as const

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
} as const

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No show',
}

export const MEETING_PROVIDERS = ['GOOGLE_MEET', 'ZOOM'] as const

export type MeetingProvider = (typeof MEETING_PROVIDERS)[number]

/** Providers a client can actually pick today. Zoom stays in the type for stored bookings. */
export const BOOKABLE_MEETING_PROVIDERS = ['GOOGLE_MEET'] as const

export const MEETING_PROVIDER_LABELS: Record<MeetingProvider, string> = {
  GOOGLE_MEET: 'Google Meet',
  ZOOM: 'Zoom',
}

export const MEETING_STATUS = {
  PENDING: 'PENDING',
  CREATED: 'CREATED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const

export type MeetingStatus = (typeof MEETING_STATUS)[keyof typeof MEETING_STATUS]

export const SLOT_DURATIONS = [15, 30, 45, 60, 90] as const

export const WEEKDAYS = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
] as const

export const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
] as const

export const REPORT_REASONS = [
  'INAPPROPRIATE_CONTENT',
  'MISLEADING_INFO',
  'SPAM',
  'HARASSMENT',
  'OTHER',
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE_CONTENT: 'Inappropriate content',
  MISLEADING_INFO: 'Misleading information',
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  OTHER: 'Other',
}

export const BOOKING_LIMITS = {
  NOTES_MAX: 1000,
  CANCEL_REASON_MAX: 300,
  CANCEL_NOTICE_MINUTES: 60,
  SLOT_WINDOW_DAYS: 14,
} as const
