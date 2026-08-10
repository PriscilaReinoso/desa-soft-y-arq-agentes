import type { LoginRequest, LoginResponse } from '../types/domain'
import { http } from './http'

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return http<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}
