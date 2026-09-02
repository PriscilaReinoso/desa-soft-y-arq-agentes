import type {
  PeriodoVentas,
  ResumenVentasOut,
  VentaCreatePayload,
  VentaOut,
  VentaUpdatePayload,
} from '../types/domain'
import { http } from './http'

export function listVentas(): Promise<VentaOut[]> {
  return http<VentaOut[]>('/ventas?skip=0&limit=100')
}

export function getResumenVentas(periodo: PeriodoVentas): Promise<ResumenVentasOut> {
  return http<ResumenVentasOut>(`/ventas/estadisticas?periodo=${periodo}`)
}

export function getVenta(identificador: string): Promise<VentaOut> {
  return http<VentaOut>(`/ventas/${identificador}`)
}

export function createVenta(payload: VentaCreatePayload): Promise<VentaOut> {
  return http<VentaOut>('/ventas', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateVenta(id: string, payload: VentaUpdatePayload): Promise<VentaOut> {
  return http<VentaOut>(`/ventas/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteVenta(id: string): Promise<void> {
  return http<void>(`/ventas/${id}`, { method: 'DELETE' })
}
