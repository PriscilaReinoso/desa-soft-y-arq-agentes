import type { InventarioAltaPayload, InventarioOut } from '../types/domain'
import { http } from './http'

export function listInventarios(params?: { skip?: number; limit?: number }): Promise<InventarioOut[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<InventarioOut[]>(`/inventarios${qs ? `?${qs}` : ''}`)
}

export function getInventario(id: string): Promise<InventarioOut> {
  return http<InventarioOut>(`/inventarios/${id}`)
}

export function altaInventario(data: InventarioAltaPayload): Promise<InventarioOut> {
  return http<InventarioOut>('/inventarios/alta', { method: 'POST', body: JSON.stringify(data) })
}

export function updateInventario(
  id: string,
  data: { espacio_id?: string | null; fila?: number | null; columna?: number | null; stock?: number; precio_venta?: number },
): Promise<InventarioOut> {
  return http<InventarioOut>(`/inventarios/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteInventario(id: string): Promise<void> {
  return http<void>(`/inventarios/${id}`, { method: 'DELETE' })
}
