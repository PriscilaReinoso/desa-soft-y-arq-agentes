import { useQuery } from '@tanstack/react-query'
import { listMedidas } from '../services/medidas.service'

export function useMedidas() {
  return useQuery({
    queryKey: ['medidas'],
    queryFn: () => listMedidas(),
  })
}
