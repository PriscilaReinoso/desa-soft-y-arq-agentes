import type { Proveedor, ProveedorCreatePayload, ProveedorUpdatePayload } from '../types/domain'
import { http } from './http'

export function listProveedores(params?: { skip?: number; limit?: number }): Promise<Proveedor[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<Proveedor[]>(`/proveedores${qs ? `?${qs}` : ''}`)
}

export function getProveedor(id: string): Promise<Proveedor> {
  return http<Proveedor>(`/proveedores/${id}`)
}

export function createProveedor(data: ProveedorCreatePayload): Promise<Proveedor> {
  return http<Proveedor>('/proveedores', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProveedor(id: string, data: ProveedorUpdatePayload): Promise<Proveedor> {
  return http<Proveedor>(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteProveedor(id: string): Promise<void> {
  return http<void>(`/proveedores/${id}`, { method: 'DELETE' })
}
