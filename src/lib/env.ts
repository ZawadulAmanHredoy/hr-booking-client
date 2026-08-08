const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

export const env = {
  apiUrl: rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl,
  isDev: import.meta.env.DEV,
} as const

export const apiBase = env.apiUrl || '/api/v1'
