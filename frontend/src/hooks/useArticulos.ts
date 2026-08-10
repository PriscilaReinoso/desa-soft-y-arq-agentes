import { useQuery } from '@tanstack/react-query'
import { listArticulos } from '../services/articulos.service'

export function useArticulos() {
  return useQuery({
    queryKey: ['articulos'],
    queryFn: () => listArticulos(),
  })
}
