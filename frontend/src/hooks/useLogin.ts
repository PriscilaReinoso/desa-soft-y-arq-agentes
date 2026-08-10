import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import type { LoginRequest } from '../types/domain'

export function useLogin() {
  const { login } = useAuth()
  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
  })
}
