import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVenta,
  deleteVenta,
  getResumenVentas,
  listVentas,
  updateVenta,
} from '../services/ventas.service'
import type { PeriodoVentas, VentaCreatePayload, VentaUpdatePayload } from '../types/domain'

export function useVentas() {
  return useQuery({
    queryKey: ['ventas'],
    queryFn: () => listVentas(),
  })
}

export function useResumenVentas(periodo: PeriodoVentas) {
  return useQuery({
    queryKey: ['ventas', 'resumen', periodo],
    queryFn: () => getResumenVentas(periodo),
  })
}

export function useCrearVenta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VentaCreatePayload) => createVenta(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios', 'bajo-minimo'] })
    },
  })
}

export function useActualizarVenta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VentaUpdatePayload }) =>
      updateVenta(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios', 'bajo-minimo'] })
    },
  })
}

export function useEliminarVenta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVenta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios', 'bajo-minimo'] })
    },
  })
}
