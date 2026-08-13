import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { altaInventario, listInventarios } from '../services/inventario.service'
import type { InventarioAltaPayload } from '../types/domain'

export function useInventarios() {
  return useQuery({
    queryKey: ['inventarios'],
    queryFn: () => listInventarios(),
  })
}

export function useAltaInventario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InventarioAltaPayload) => altaInventario(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
    },
  })
}
