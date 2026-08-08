import { apiClient, getApiErrorMessage } from './client'

export interface GoogleConnection {
  configured: boolean
  connected: boolean
  accountEmail?: string
  scopes: string[]
  connectedAt?: string
  needsReconnect: boolean
  lastError?: string
}

function toError(message: string, cause: unknown): Error {
  return new Error(message, { cause })
}

export async function getIntegrations(): Promise<GoogleConnection> {
  try {
    const res = await apiClient.get<{ success: true; data: { google: GoogleConnection } }>(
      '/integrations',
    )
    return res.data.data.google
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not load your integrations.'), error)
  }
}

/** Returns the Google consent URL; the browser must navigate to it (not fetch it). */
export async function getGoogleConnectUrl(): Promise<string> {
  try {
    const res = await apiClient.get<{ success: true; data: { url: string } }>(
      '/integrations/google/connect',
    )
    return res.data.data.url
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not start the Google connection.'), error)
  }
}

export async function disconnectGoogle(): Promise<GoogleConnection> {
  try {
    const res = await apiClient.delete<{ success: true; data: { google: GoogleConnection } }>(
      '/integrations/google',
    )
    return res.data.data.google
  } catch (error) {
    throw toError(getApiErrorMessage(error, 'Could not disconnect your Google account.'), error)
  }
}
