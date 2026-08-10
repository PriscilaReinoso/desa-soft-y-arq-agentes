import type { Categoria } from '../types/domain'
import { http } from './http'

export function listCategorias(params?: { skip?: number; limit?: number }): Promise<Categoria[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  const qs = query.toString()
  return http<Categoria[]>(`/categorias${qs ? `?${qs}` : ''}`)
}

export function getCategoria(id: string): Promise<Categoria> {
  return http<Categoria>(`/categorias/${id}`)
}

export function createCategoria(data: { nombre: string; descripcion?: string | null }): Promise<Categoria> {
  return http<Categoria>('/categorias', { method: 'POST', body: JSON.stringify(data) })
}

export function updateCategoria(id: string, data: Partial<Categoria>): Promise<Categoria> {
  return http<Categoria>(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteCategoria(id: string): Promise<void> {
  return http<void>(`/categorias/${id}`, { method: 'DELETE' })
}
