import type { Medida } from '../types/domain'
import { http } from './http'

export function listMedidas(params?: { skip?: number; limit?: number }): Promise<Medida[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<Medida[]>(`/medidas${qs ? `?${qs}` : ''}`)
}

export function getMedida(id: string): Promise<Medida> {
  return http<Medida>(`/medidas/${id}`)
}

export function createMedida(data: { unidad_medida: string; medida: string }): Promise<Medida> {
  return http<Medida>('/medidas', { method: 'POST', body: JSON.stringify(data) })
}

export function updateMedida(id: string, data: Partial<Medida>): Promise<Medida> {
  return http<Medida>(`/medidas/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteMedida(id: string): Promise<void> {
  return http<void>(`/medidas/${id}`, { method: 'DELETE' })
}
