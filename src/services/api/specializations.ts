import { apiClient, getApiErrorMessage } from './client'

export interface SpecializationOption {
  id: string
  slug: string
  name: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

/** Public — active specializations only, used to populate directory filters and profile forms. */
export async function listSpecializations(): Promise<SpecializationOption[]> {
  try {
    const res = await apiClient.get<{
      success: true
      data: { specializations: SpecializationOption[] }
    }>('/specializations')
    return res.data.data.specializations
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load specializations.'), error)
  }
}
