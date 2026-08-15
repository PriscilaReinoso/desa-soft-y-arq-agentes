import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listArticulos, updateArticulo } from '../services/articulos.service'

export function useArticulos(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['articulos'],
    queryFn: () => listArticulos(),
    ...options,
  })
}

export function useActualizarArticulo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { nombre?: string; descripcion?: string | null; categoria_id?: string }
    }) => updateArticulo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios'] })
      queryClient.invalidateQueries({ queryKey: ['inventarios', 'bajo-minimo'] })
    },
  })
}
