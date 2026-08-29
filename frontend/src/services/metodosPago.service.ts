import type { MetodoPago } from '../types/domain'
import { http } from './http'

export function listMetodosPago(): Promise<MetodoPago[]> {
  return http<MetodoPago[]>('/metodos-pago')
}
