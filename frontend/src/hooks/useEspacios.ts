import { useQuery } from '@tanstack/react-query'
import { listEspacios } from '../services/espacios.service'

export function useEspacios(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['espacios'],
    queryFn: () => listEspacios(),
    ...options,
  })
}
