import type { Espacio } from '../types/domain'
import { http } from './http'

export function listEspacios(params?: { skip?: number; limit?: number }): Promise<Espacio[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<Espacio[]>(`/espacios${qs ? `?${qs}` : ''}`)
}

export function getEspacio(id: string): Promise<Espacio> {
  return http<Espacio>(`/espacios/${id}`)
}

export function createEspacio(data: {
  tipo?: string | null
  descripcion?: string | null
  deposito_id: string
  max_fila: number
  max_columna: number
}): Promise<Espacio> {
  return http<Espacio>('/espacios', { method: 'POST', body: JSON.stringify(data) })
}

export function updateEspacio(id: string, data: Partial<Espacio>): Promise<Espacio> {
  return http<Espacio>(`/espacios/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteEspacio(id: string): Promise<void> {
  return http<void>(`/espacios/${id}`, { method: 'DELETE' })
}
