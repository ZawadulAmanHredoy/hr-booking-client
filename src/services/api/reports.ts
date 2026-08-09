import { apiClient, getApiErrorMessage } from './client'
import type { ReportReason } from '@/lib/constants'

export interface CreateReportInput {
  hrProfileId: string
  reason: ReportReason
  details?: string
}

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

export async function createReport(input: CreateReportInput): Promise<void> {
  try {
    await apiClient.post('/reports', input)
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not submit this report.'), error)
  }
}
