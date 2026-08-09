import { apiClient, getApiErrorMessage } from './client'
import type { Currency, Specialization } from '@/lib/constants'

export type UserRole = 'USER' | 'HR' | 'ADMIN' | 'SUPER_ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED'

export interface PublicUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  phone?: string
  profileImageUrl?: string
  createdAt: string
}

export interface AuthResponseData {
  user: PublicUser
  message?: string
}

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface WorkHistoryEntryInput {
  company: string
  role: string
  startYear: number
  endYear?: number
  description?: string
}

export interface RegisterHrInput {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  profileImageUrl?: string
  headline: string
  bio: string
  specializations: Specialization[]
  yearsOfExperience: number
  companyName: string
  hourlyRateCents: number
  currency: Currency
  languages: string[]
  city?: string
  country?: string
  workHistory: WorkHistoryEntryInput[]
}

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

export async function register(input: RegisterInput): Promise<AuthResponseData> {
  try {
    const res = await apiClient.post<{ success: true; data: AuthResponseData }>(
      '/auth/register',
      input,
    )
    return res.data.data
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Registration failed.'), error)
  }
}

export async function registerHr(input: RegisterHrInput): Promise<AuthResponseData> {
  try {
    const res = await apiClient.post<{ success: true; data: AuthResponseData }>(
      '/auth/register-hr',
      input,
    )
    return res.data.data
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Registration failed.'), error)
  }
}

export async function login(input: LoginInput): Promise<AuthResponseData> {
  try {
    const res = await apiClient.post<{ success: true; data: AuthResponseData }>(
      '/auth/login',
      input,
    )
    return res.data.data
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Login failed.'), error)
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Logout failed.'), error)
  }
}

export async function getMe(): Promise<PublicUser> {
  try {
    const res = await apiClient.get<{ success: true; data: { user: PublicUser } }>('/auth/me')
    return res.data.data.user
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load your session.'), error)
  }
}

export async function verifyEmail(token: string): Promise<AuthResponseData> {
  try {
    const res = await apiClient.post<{ success: true; data: AuthResponseData }>(
      '/auth/verify-email',
      { token },
    )
    return res.data.data
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'The verification link is invalid or expired.'), error)
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await apiClient.post('/auth/forgot-password', { email })
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Something went wrong.'), error)
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  try {
    await apiClient.post('/auth/reset-password', { token, password })
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'The reset link is invalid or expired.'), error)
  }
}
