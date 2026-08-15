import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  altaInventario,
  deleteInventario,
  getInventarioResumen,
  getInventariosBajoMinimo,
  listInventarios,
  updateInventario,
} from '../services/inventario.service'
import type { InventarioAltaPayload } from '../types/domain'

export function useInventarios() {
  return useQuery({
    queryKey: ['inventarios'],
    queryFn: () => listInventarios(),
  })
}

export function useInventariosBajoMinimo() {
  return useQuery({
    queryKey: ['inventarios', 'bajo-minimo'],
    queryFn: () => getInventariosBajoMinimo(),
    retry: false,
  })
}

export function useInventarioResumen() {
  return useQuery({
    queryKey: ['inventarios', 'resumen'],
    queryFn: () => getInventarioResumen(),
    retry: false,
  })
}

export function useAltaInventario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InventarioAltaPayload) => altaInventario(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios', 'bajo-minimo'] })
    },
  })
}

export function useActualizarInventario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        medida_id?: string
        espacio_id?: string | null
        fila?: number | null
        columna?: number | null
        stock?: number
        minimo_stock?: number
        precio_venta?: number
        medida_venta_id?: string | null
      }
    }) => updateInventario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios', 'bajo-minimo'] })
    },
  })
}

export function useEliminarInventario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteInventario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios', 'bajo-minimo'] })
    },
  })
}
