const API_URL = import.meta.env.VITE_API_URL || 'https://qap5hv2lia.execute-api.us-east-1.amazonaws.com/api'

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, '')
}

export async function apiFetch<T>(path: string, token?: string, options?: RequestInit): Promise<T> {
  const url = `${getApiUrl()}${path.startsWith('/') ? path : '/' + path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  }
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  const json = await res.json()
  return (json.data ?? json) as T
}