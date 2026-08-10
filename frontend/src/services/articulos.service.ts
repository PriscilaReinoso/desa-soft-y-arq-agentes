import type { Articulo } from '../types/domain'
import { http } from './http'

export function listArticulos(params?: { skip?: number; limit?: number }): Promise<Articulo[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<Articulo[]>(`/articulos${qs ? `?${qs}` : ''}`)
}

export function getArticulo(id: string): Promise<Articulo> {
  return http<Articulo>(`/articulos/${id}`)
}

export function createArticulo(data: { nombre: string; descripcion?: string | null; categoria_id: string }): Promise<Articulo> {
  return http<Articulo>('/articulos', { method: 'POST', body: JSON.stringify(data) })
}

export function updateArticulo(id: string, data: Partial<Articulo>): Promise<Articulo> {
  return http<Articulo>(`/articulos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteArticulo(id: string): Promise<void> {
  return http<void>(`/articulos/${id}`, { method: 'DELETE' })
}
