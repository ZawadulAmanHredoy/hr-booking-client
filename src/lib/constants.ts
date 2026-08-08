export const SPECIALIZATIONS = [
  'RECRUITMENT',
  'COMPENSATION_BENEFITS',
  'EMPLOYEE_RELATIONS',
  'PERFORMANCE_MANAGEMENT',
  'TRAINING_DEVELOPMENT',
  'HR_OPERATIONS',
  'LABOR_LAW_COMPLIANCE',
  'ORGANIZATIONAL_DEVELOPMENT',
  'HRIS',
  'DIVERSITY_INCLUSION',
] as const

export type Specialization = (typeof SPECIALIZATIONS)[number]

export const SPECIALIZATION_LABELS: Record<Specialization, string> = {
  RECRUITMENT: 'Recruitment & Talent',
  COMPENSATION_BENEFITS: 'Compensation & Benefits',
  EMPLOYEE_RELATIONS: 'Employee Relations',
  PERFORMANCE_MANAGEMENT: 'Performance Management',
  TRAINING_DEVELOPMENT: 'Training & Development',
  HR_OPERATIONS: 'HR Operations',
  LABOR_LAW_COMPLIANCE: 'Labor Law & Compliance',
  ORGANIZATIONAL_DEVELOPMENT: 'Organizational Development',
  HRIS: 'HRIS & Technology',
  DIVERSITY_INCLUSION: 'Diversity & Inclusion',
}

export const PROFILE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const

export type ProfileStatus = (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS]

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'CAD', 'AUD'] as const

export type Currency = (typeof CURRENCIES)[number]

export const PROFILE_LIMITS = {
  SPECIALIZATIONS_MIN: 1,
  SPECIALIZATIONS_MAX: 5,
  LANGUAGES_MIN: 1,
  LANGUAGES_MAX: 5,
  CERTIFICATIONS_MAX: 10,
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

export const MEETING_PROVIDER_LABELS: Record<MeetingProvider, string> = {
  GOOGLE_MEET: 'Google Meet',
  ZOOM: 'Zoom',
}

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

export const BOOKING_LIMITS = {
  NOTES_MAX: 1000,
  CANCEL_REASON_MAX: 300,
  CANCEL_NOTICE_MINUTES: 60,
  SLOT_WINDOW_DAYS: 14,
} as const
