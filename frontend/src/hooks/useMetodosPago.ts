import { useQuery } from '@tanstack/react-query'
import { listMetodosPago } from '../services/metodosPago.service'

export function useMetodosPago(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['metodos-pago'],
    queryFn: () => listMetodosPago(),
    ...options,
  })
}
