import axios from 'axios'
import { apiBase } from '@/lib/env'

export const apiClient = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
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
