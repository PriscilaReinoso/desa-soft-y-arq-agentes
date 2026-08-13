import { useQuery } from '@tanstack/react-query'
import { listDepositos } from '../services/depositos.service'

export function useDepositos(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['depositos'],
    queryFn: () => listDepositos(),
    ...options,
  })
}
