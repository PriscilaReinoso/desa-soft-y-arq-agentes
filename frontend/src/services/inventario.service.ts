import type { Inventario } from '../types/domain'
import { http } from './http'

export function listInventarios(params?: { skip?: number; limit?: number }): Promise<Inventario[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<Inventario[]>(`/inventarios${qs ? `?${qs}` : ''}`)
}

export function getInventario(id: string): Promise<Inventario> {
  return http<Inventario>(`/inventarios/${id}`)
}

export function createInventario(data: {
  articulo_id: string
  medida_id: string
  espacio_id?: string | null
  fila?: number | null
  columna?: number | null
  stock: number
  precio_venta: number
}): Promise<Inventario> {
  return http<Inventario>('/inventarios', { method: 'POST', body: JSON.stringify(data) })
}

export function updateInventario(id: string, data: Partial<Inventario>): Promise<Inventario> {
  return http<Inventario>(`/inventarios/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteInventario(id: string): Promise<void> {
  return http<void>(`/inventarios/${id}`, { method: 'DELETE' })
}
