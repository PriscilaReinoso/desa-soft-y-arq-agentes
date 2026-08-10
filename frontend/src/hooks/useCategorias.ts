import { useQuery } from '@tanstack/react-query'
import { listCategorias } from '../services/categorias.service'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => listCategorias(),
  })
}
