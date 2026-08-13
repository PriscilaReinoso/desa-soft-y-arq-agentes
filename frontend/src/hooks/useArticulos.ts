import { useQuery } from '@tanstack/react-query'
import { listArticulos } from '../services/articulos.service'

export function useArticulos(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['articulos'],
    queryFn: () => listArticulos(),
    ...options,
  })
}
