import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createListaPrecios,
  createListaPreciosExcel,
  deleteListaPrecios,
  getCantidadListasPorProveedor,
  listListasPrecios,
  updateListaPrecios,
} from '../services/listasPrecios.service'
import type {
  ListaPreciosAltaPayload,
  ListaPreciosUpdatePayload,
} from '../types/domain'

export type ListasPreciosFiltros = {
  proveedor_id?: string
  categoria_ids?: string[]
  skip?: number
  limit?: number
}

export function useCantidadListasPorProveedor() {
  return useQuery({
    queryKey: ['listas-precios', 'cantidad-por-proveedor'],
    queryFn: getCantidadListasPorProveedor,
  })
}

export function useListasPrecios(filtros: ListasPreciosFiltros = {}, opciones: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [
      'listas-precios',
      {
        proveedor_id: filtros.proveedor_id,
        categoria_ids: filtros.categoria_ids,
        skip: filtros.skip,
        limit: filtros.limit,
      },
    ],
    queryFn: () => listListasPrecios(filtros),
    enabled: opciones.enabled,
  })
}

export function useCrearListaPrecios() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ListaPreciosAltaPayload) => createListaPrecios(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas-precios'] })
    },
  })
}

export function useCrearListaPreciosExcel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createListaPreciosExcel(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas-precios'] })
    },
  })
}

export function useActualizarListaPrecio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ListaPreciosUpdatePayload }) =>
      updateListaPrecios(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas-precios'] })
    },
  })
}

export function useEliminarListaPrecio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteListaPrecios(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas-precios'] })
    },
  })
}
