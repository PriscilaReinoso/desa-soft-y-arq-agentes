import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProveedor,
  deleteProveedor,
  listProveedores,
  updateProveedor,
} from '../services/proveedores.service'
import type { ProveedorCreatePayload, ProveedorUpdatePayload } from '../types/domain'

export function useProveedores(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: () => listProveedores(),
    ...options,
  })
}

export function useCrearProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProveedorCreatePayload) => createProveedor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    },
  })
}

export function useActualizarProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProveedorUpdatePayload }) => updateProveedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    },
  })
}

export function useEliminarProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProveedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    },
  })
}
