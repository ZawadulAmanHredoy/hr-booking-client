import { apiClient, getApiErrorMessage } from './client'
import type { Pagination } from './hrProfiles'
import type { Booking } from './bookings'
import type { SpecializationOption } from './specializations'
import type { BookingStatus, Currency, ProfileStatus, UserStatus } from '@/lib/constants'
import type { UserRole } from '@/services/api/auth'

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

export interface DashboardStats {
  totalUsers: number
  totalHrProfessionals: number
  pendingHrApplications: number
  suspendedUsers: number
  totalBookings: number
  todaysBookings: number
  completedBookings: number
  cancelledBookings: number
  pendingReports: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const res = await apiClient.get<{ success: true; data: { stats: DashboardStats } }>(
      '/admin/dashboard',
    )
    return res.data.data.stats
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load dashboard stats.'), error)
  }
}

export interface PlatformSettings {
  environment: string
  clientUrl: string
  emailTransport: string
  googleIntegrationConfigured: boolean
  redisConnected: boolean
  queuePrefix: string
  rateLimits: { authPerFifteenMinutes: number; apiPerMinute: number }
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const res = await apiClient.get<{ success: true; data: { settings: PlatformSettings } }>(
      '/admin/settings',
    )
    return res.data.data.settings
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load platform settings.'), error)
  }
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface ListUsersParams {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
  search?: string
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<{ data: AdminUser[]; pagination: Pagination }> {
  try {
    const res = await apiClient.get<{ success: true; data: AdminUser[]; pagination: Pagination }>(
      '/admin/users',
      { params },
    )
    return { data: res.data.data, pagination: res.data.pagination }
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load users.'), error)
  }
}

export async function getUser(
  id: string,
): Promise<{ user: AdminUser; hrProfile?: { id: string; status: ProfileStatus } | null }> {
  try {
    const res = await apiClient.get<{
      success: true
      data: { user: AdminUser; hrProfile?: { id: string; status: ProfileStatus } | null }
    }>(`/admin/users/${id}`)
    return res.data.data
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load this user.'), error)
  }
}

export async function suspendUser(id: string, reason: string): Promise<AdminUser> {
  try {
    const res = await apiClient.patch<{ success: true; data: { user: AdminUser } }>(
      `/admin/users/${id}/suspend`,
      { reason },
    )
    return res.data.data.user
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not suspend this account.'), error)
  }
}

export async function reactivateUser(id: string): Promise<AdminUser> {
  try {
    const res = await apiClient.patch<{ success: true; data: { user: AdminUser } }>(
      `/admin/users/${id}/reactivate`,
    )
    return res.data.data.user
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not reactivate this account.'), error)
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/users/${id}`)
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not delete this account.'), error)
  }
}

export interface AdminHRProfile {
  id: string
  user?: { id: string; firstName: string; lastName: string; email: string; status: UserStatus }
  headline: string
  specializations: string[]
  yearsOfExperience: number
  companyName?: string
  hourlyRateCents: number
  currency: Currency
  status: ProfileStatus
  rejectionReason?: string
  reviewedAt?: string
  isAvailable: boolean
  rating: number
  ratingCount: number
  createdAt: string
  updatedAt: string
}

export interface ListAdminProfilesParams {
  page?: number
  limit?: number
  status?: ProfileStatus
  search?: string
}

export async function listAdminProfiles(
  params: ListAdminProfilesParams = {},
): Promise<{ data: AdminHRProfile[]; pagination: Pagination }> {
  try {
    const res = await apiClient.get<{
      success: true
      data: AdminHRProfile[]
      pagination: Pagination
    }>('/admin/hr-profiles', { params })
    return { data: res.data.data, pagination: res.data.pagination }
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load HR applications.'), error)
  }
}

export async function approveHrProfile(id: string): Promise<AdminHRProfile> {
  try {
    const res = await apiClient.patch<{ success: true; data: { profile: AdminHRProfile } }>(
      `/admin/hr-profiles/${id}/approve`,
    )
    return res.data.data.profile
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not approve this profile.'), error)
  }
}

export async function rejectHrProfile(id: string, reason: string): Promise<AdminHRProfile> {
  try {
    const res = await apiClient.patch<{ success: true; data: { profile: AdminHRProfile } }>(
      `/admin/hr-profiles/${id}/reject`,
      { reason },
    )
    return res.data.data.profile
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not reject this profile.'), error)
  }
}

export interface ListAdminBookingsParams {
  page?: number
  limit?: number
  status?: BookingStatus
  userId?: string
  hrUserId?: string
}

export async function listAdminBookings(
  params: ListAdminBookingsParams = {},
): Promise<{ data: Booking[]; pagination: Pagination }> {
  try {
    const res = await apiClient.get<{ success: true; data: Booking[]; pagination: Pagination }>(
      '/admin/bookings',
      { params },
    )
    return { data: res.data.data, pagination: res.data.pagination }
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load bookings.'), error)
  }
}

export async function listAdminSpecializations(): Promise<SpecializationOption[]> {
  try {
    const res = await apiClient.get<{
      success: true
      data: { specializations: SpecializationOption[] }
    }>('/admin/specializations')
    return res.data.data.specializations
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load specializations.'), error)
  }
}

export interface CreateSpecializationInput {
  slug: string
  name: string
  description?: string
}

export async function createAdminSpecialization(
  input: CreateSpecializationInput,
): Promise<SpecializationOption> {
  try {
    const res = await apiClient.post<{
      success: true
      data: { specialization: SpecializationOption }
    }>('/admin/specializations', input)
    return res.data.data.specialization
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not create this specialization.'), error)
  }
}

export interface UpdateSpecializationInput {
  name?: string
  description?: string
  isActive?: boolean
}

export async function updateAdminSpecialization(
  id: string,
  input: UpdateSpecializationInput,
): Promise<SpecializationOption> {
  try {
    const res = await apiClient.patch<{
      success: true
      data: { specialization: SpecializationOption }
    }>(`/admin/specializations/${id}`, input)
    return res.data.data.specialization
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not update this specialization.'), error)
  }
}

export async function deleteAdminSpecialization(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/specializations/${id}`)
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not delete this specialization.'), error)
  }
}

export interface AdminReport {
  id: string
  reporter: { id: string; firstName?: string; lastName?: string; email?: string }
  profile: { id: string; headline?: string }
  hrUser: { id: string; firstName?: string; lastName?: string; email?: string }
  reason: string
  details?: string
  status: 'PENDING' | 'DISMISSED' | 'ACTIONED'
  resolvedBy?: { id: string; firstName?: string; lastName?: string }
  resolvedAt?: string
  resolutionNotes?: string
  createdAt: string
}

export async function listAdminReports(
  params: { page?: number; limit?: number; status?: string } = {},
): Promise<{ data: AdminReport[]; pagination: Pagination }> {
  try {
    const res = await apiClient.get<{ success: true; data: AdminReport[]; pagination: Pagination }>(
      '/admin/reports',
      { params },
    )
    return { data: res.data.data, pagination: res.data.pagination }
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load reports.'), error)
  }
}

export async function resolveReport(
  id: string,
  status: 'DISMISSED' | 'ACTIONED',
  notes?: string,
): Promise<AdminReport> {
  try {
    const res = await apiClient.patch<{ success: true; data: { report: AdminReport } }>(
      `/admin/reports/${id}/resolve`,
      { status, notes },
    )
    return res.data.data.report
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not resolve this report.'), error)
  }
}

export interface AuditLogEntry {
  id: string
  actor: { id: string; firstName?: string; lastName?: string; email?: string }
  actorRole: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export async function listAuditLogs(
  params: { page?: number; limit?: number; action?: string; actorId?: string } = {},
): Promise<{ data: AuditLogEntry[]; pagination: Pagination }> {
  try {
    const res = await apiClient.get<{
      success: true
      data: AuditLogEntry[]
      pagination: Pagination
    }>('/admin/audit-logs', { params })
    return { data: res.data.data, pagination: res.data.pagination }
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load audit logs.'), error)
  }
}
