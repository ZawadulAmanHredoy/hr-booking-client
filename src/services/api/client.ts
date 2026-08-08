import axios, { type InternalAxiosRequestConfig } from 'axios'
import { apiBase } from '@/lib/env'

export const apiClient = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

type SessionExpiredHandler = () => void

let onSessionExpired: SessionExpiredHandler | null = null

export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler
}

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retried?: boolean }

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || !error.config || error.response?.status !== 401) {
    return Promise.reject(error)
  }

  const original = error.config as RetryableRequestConfig
  const isRefreshCall = original.url?.includes('/auth/refresh')

  if (!original._retried && !isRefreshCall) {
    original._retried = true
    try {
      await apiClient.post('/auth/refresh')
      return await apiClient(original)
    } catch {
      onSessionExpired?.()
      return Promise.reject(error)
    }
  }

  if (isRefreshCall) {
    onSessionExpired?.()
  }
  return Promise.reject(error)
})

export interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as Partial<ApiErrorBody> | undefined
    if (body?.error?.message) {
      return body.error.message
    }
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.'
    }
  }
  return fallback
}
