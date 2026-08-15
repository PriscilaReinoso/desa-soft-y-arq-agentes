import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDeposito, listDepositos, updateDeposito } from '../services/depositos.service'

export function useDepositos(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['depositos'],
    queryFn: () => listDepositos(),
    ...options,
  })
}

export function useCrearDeposito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string | null; direccion?: string | null }) =>
      createDeposito(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depositos'] })
    },
  })
}

export function useActualizarDeposito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { nombre: string; descripcion?: string | null; direccion?: string | null }
    }) => updateDeposito(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depositos'] })
    },
  })
}
