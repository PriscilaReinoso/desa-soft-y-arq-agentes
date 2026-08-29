import type {
  CantidadListaPorProveedor,
  ListaPrecioOut,
  ListaPreciosAltaPayload,
  ListaPreciosUpdatePayload,
} from '../types/domain'
import { http } from './http'

export function getCantidadListasPorProveedor(): Promise<CantidadListaPorProveedor[]> {
  return http<CantidadListaPorProveedor[]>('/listas-precios/cantidad-por-proveedor')
}

export function listListasPrecios(params?: {
  skip?: number
  limit?: number
  categoria_ids?: string[]
  articulos?: string[]
  proveedor_id?: string
}): Promise<ListaPrecioOut[]> {
  const query = new URLSearchParams()
  if (params?.skip !== undefined) query.set('skip', String(params.skip))
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  if (params?.proveedor_id) query.set('proveedor_id', params.proveedor_id)
  params?.categoria_ids?.forEach((id) => query.append('categoria_ids', id))
  params?.articulos?.forEach((id) => query.append('articulos', id))
  const qs = query.toString()
  return http<ListaPrecioOut[]>(`/listas-precios${qs ? `?${qs}` : ''}`)
}

export function createListaPrecios(data: ListaPreciosAltaPayload): Promise<ListaPrecioOut[]> {
  return http<ListaPrecioOut[]>('/listas-precios', { method: 'POST', body: JSON.stringify(data) })
}

export function createListaPreciosExcel(formData: FormData): Promise<ListaPrecioOut[]> {
  return http<ListaPrecioOut[]>('/listas-precios/excel', { method: 'POST', body: formData })
}

export function updateListaPrecios(
  id: string,
  data: ListaPreciosUpdatePayload,
): Promise<ListaPrecioOut> {
  return http<ListaPrecioOut>(`/listas-precios/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteListaPrecios(id: string): Promise<void> {
  return http<void>(`/listas-precios/${id}`, { method: 'DELETE' })
}
