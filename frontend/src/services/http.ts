export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

export const TOKEN_STORAGE_KEY = 'ferrestock.access_token'

export const UNAUTHORIZED_EVENT = 'ferrestock:unauthorized'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const isFormData = options.body instanceof FormData
  if (!isFormData) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }

  if (response.status === 401) {
    clearToken()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  if (!response.ok) {
    let message = `Error ${response.status}`
    try {
      const body = (await response.json()) as { detail?: unknown; message?: string }
      if (typeof body.detail === 'string') message = body.detail
      else if (Array.isArray(body.detail)) {
        const parts = body.detail
          .map((d) => (typeof d === 'object' && d && typeof (d as { msg?: unknown }).msg === 'string' ? (d as { msg: string }).msg : null))
          .filter((m): m is string => Boolean(m))
        if (parts.length > 0) message = parts.join(', ')
      } else if (body.message) message = body.message
    } catch {
      // keep default message
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
