import { createApiError, reportGlobalError } from '../lib/errors'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init: RequestInit, token?: string): Promise<T> {
  let res: Response

  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    })
  } catch (error) {
    reportGlobalError(error, 'Network request failed.')
    throw error
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const error = createApiError(body, res.status, res.statusText)
    reportGlobalError(error)
    throw error
  }
  return res.json().then((r: { data?: T } & T) => (r as { data?: T }).data ?? r)
}

export const apiGet = <T>(path: string, token: string) =>
  request<T>(path, {}, token)

export const apiPost = <T>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token)

export const apiPatch = <T>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token)
