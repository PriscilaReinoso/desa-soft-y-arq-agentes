import { useQuery } from '@tanstack/react-query'
import { listInventarios } from '../services/inventario.service'

export function useInventarios() {
  return useQuery({
    queryKey: ['inventarios'],
    queryFn: () => listInventarios(),
  })
}
