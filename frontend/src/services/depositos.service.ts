import type { Deposito } from '../types/domain'
import { http } from './http'

export function listDepositos(params?: { skip?: number; limit?: number }): Promise<Deposito[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<Deposito[]>(`/depositos${qs ? `?${qs}` : ''}`)
}

export function getDeposito(id: string): Promise<Deposito> {
  return http<Deposito>(`/depositos/${id}`)
}

export function createDeposito(data: { nombre: string; descripcion?: string | null; direccion?: string | null }): Promise<Deposito> {
  return http<Deposito>('/depositos', { method: 'POST', body: JSON.stringify(data) })
}

export function updateDeposito(id: string, data: Partial<Deposito>): Promise<Deposito> {
  return http<Deposito>(`/depositos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteDeposito(id: string): Promise<void> {
  return http<void>(`/depositos/${id}`, { method: 'DELETE' })
}
