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
