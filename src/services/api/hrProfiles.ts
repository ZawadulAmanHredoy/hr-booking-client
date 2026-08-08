import { apiClient, getApiErrorMessage } from './client'
import type { Currency, ProfileStatus, Specialization } from '@/lib/constants'

export interface ProfileUser {
  id: string
  firstName: string
  lastName: string
}

export interface Certification {
  title: string
  issuer: string
  year: number
}

export interface HRProfile {
  id: string
  user?: ProfileUser
  headline: string
  bio: string
  specializations: Specialization[]
  yearsOfExperience: number
  hourlyRateCents: number
  currency: Currency
  languages: string[]
  city?: string
  country?: string
  profileImageUrl?: string
  certifications: Certification[]
  isAvailable: boolean
  rating: number
  ratingCount: number
  createdAt: string
}

export interface OwnHRProfile extends Omit<HRProfile, 'user'> {
  status: ProfileStatus
  updatedAt: string
}

export interface ListProfilesParams {
  page?: number
  limit?: number
  search?: string
  specialization?: Specialization
  language?: string
  minRateCents?: number
  maxRateCents?: number
  sortBy?: 'rating' | 'hourlyRateCents' | 'newest'
  sortOrder?: 'asc' | 'desc'
}

export interface Pagination {
  page: number
  total: number
  totalPages: number
  limit: number
}

export interface ListProfilesResult {
  data: HRProfile[]
  pagination: Pagination
}

export interface UpsertProfileInput {
  headline: string
  bio: string
  specializations: Specialization[]
  yearsOfExperience: number
  hourlyRateCents: number
  currency: Currency
  languages: string[]
  city?: string
  country?: string
  profileImageUrl?: string
  certifications?: Certification[]
}

export interface UpsertProfileResult {
  profile: OwnHRProfile
  upgraded: boolean
}

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

export async function listProfiles(params: ListProfilesParams = {}): Promise<ListProfilesResult> {
  try {
    const res = await apiClient.get<{ success: true; data: HRProfile[]; pagination: Pagination }>(
      '/profiles',
      { params },
    )
    return { data: res.data.data, pagination: res.data.pagination }
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load HR professionals.'), error)
  }
}

export async function getProfile(id: string): Promise<HRProfile> {
  try {
    const res = await apiClient.get<{ success: true; data: { profile: HRProfile } }>(
      `/profiles/${id}`,
    )
    return res.data.data.profile
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Profile not found.'), error)
  }
}

export async function getMyProfile(): Promise<OwnHRProfile> {
  try {
    const res = await apiClient.get<{ success: true; data: { profile: OwnHRProfile } }>(
      '/profiles/me',
    )
    return res.data.data.profile
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load your profile.'), error)
  }
}

export async function upsertProfile(input: UpsertProfileInput): Promise<UpsertProfileResult> {
  try {
    const res = await apiClient.put<{
      success: true
      data: UpsertProfileResult
    }>('/profiles/me', input)
    return res.data.data
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not save your profile.'), error)
  }
}

export async function setProfileStatus(status: ProfileStatus): Promise<OwnHRProfile> {
  try {
    const res = await apiClient.patch<{ success: true; data: { profile: OwnHRProfile } }>(
      '/profiles/me/publish',
      { status },
    )
    return res.data.data.profile
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not update your profile status.'), error)
  }
}

export async function setAvailability(isAvailable: boolean): Promise<OwnHRProfile> {
  try {
    const res = await apiClient.patch<{ success: true; data: { profile: OwnHRProfile } }>(
      '/profiles/me/availability',
      { isAvailable },
    )
    return res.data.data.profile
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not update your availability.'), error)
  }
}
