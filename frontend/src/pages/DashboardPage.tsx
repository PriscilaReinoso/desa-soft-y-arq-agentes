import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/http'
import { useInventarioResumen, useInventarios, useInventariosBajoMinimo } from '../hooks/useInventarios'
import { mockUsuario } from '../data/mock'
import type { Kpi } from '../types/domain'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import KpiCard from '../components/KpiCard'
import PageContainer from '../components/ui/PageContainer'
import ProgressBar from '../components/ui/ProgressBar'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const firstName = (usuario ?? mockUsuario).nombre

  const resumenQuery = useInventarioResumen()
  const inventariosQuery = useInventarios()
  const bajoMinimoQuery = useInventariosBajoMinimo()

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  const stockValue = useMemo(() => {
    if (resumenQuery.data !== undefined) {
      return resumenQuery.data.total_articulos.toLocaleString('es-AR')
    }
    const rows = inventariosQuery.data ?? []
    return new Set(rows.map((r) => r.articulo.id)).size.toLocaleString('es-AR')
  }, [resumenQuery.data, inventariosQuery.data])

  const showError = resumenQuery.isError && inventariosQuery.isError

  const bajoMinimo = bajoMinimoQuery.data ?? []
  const bajoMinimoUnavailable = bajoMinimoQuery.isError

  const inventarioError = (() => {
    if (!inventariosQuery.error) return null
    return inventariosQuery.error instanceof ApiError
      ? inventariosQuery.error.message
      : inventariosQuery.error.message
  })()

  const kpis: Kpi[] = [
    {
      label: 'Artículos en stock',
      value: showError ? '—' : stockValue,
      delta: showError ? 'No disponible' : 'Actualizado desde la API',
      color: '#4A6B8A',
      icon: '📦',
    },
    { label: 'Ventas del mes', value: '—', delta: 'Sin información', color: '#C8763A', icon: '💰' },
    { label: 'Órdenes pendientes', value: '—', delta: 'Sin información', color: '#A05C7B', icon: '🕐' },
    {
      label: 'Stock bajo mínimo',
      value: bajoMinimoUnavailable ? '—' : bajoMinimo.length.toLocaleString('es-AR'),
      delta: bajoMinimoUnavailable ? 'Sin información' : 'Requiere reposición',
      color: '#7B9A4A',
      icon: '⚠️',
    },
  ]

  if (resumenQuery.isPending || inventariosQuery.isPending) {
    return (
      <PageContainer maxWidth={1100}>
        <EmptyState message="Cargando resumen del día…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth={1100}>
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-extrabold text-2xl m-0 text-foreground">
          Buenos días, {firstName} 👋
        </h1>
        <p className="mt-1 m-0 text-muted-foreground text-sm">
          Resumen del día — {today}
        </p>
      </div>

      {showError && (
        <Alert size="md" style={{ marginBottom: 20 }}>
          {inventarioError}
        </Alert>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_340px] gap-5">
        {/* Recent sales */}
        <Card>
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="font-bold text-[15px]">Ventas recientes</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/ventas')}>
              Ver todas →
            </Button>
          </div>
          <div className="p-5">
            <EmptyState message="Sin información disponible" />
          </div>
        </Card>

        {/* Low stock alert */}
        <Card>
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="font-bold text-[15px]">⚠️ Stock bajo mínimo</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')}>
              Ver →
            </Button>
          </div>
          {bajoMinimoQuery.isPending ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground font-semibold">
              Cargando…
            </div>
          ) : bajoMinimoUnavailable || bajoMinimo.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground font-semibold">
              Sin información
            </div>
          ) : (
            bajoMinimo.map((item, i) => {
              const pct = Math.min(100, Math.round((item.stock / item.minimo_stock) * 100))
              const unidad = `${item.medida.medida} ${item.medida.unidad_medida}`.trim()
              return (
                <div
                  key={item.id}
                  className={`px-5 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <div className="font-semibold text-[13px] mb-1">{item.articulo.nombre}</div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      {item.stock} {unidad} de {item.minimo_stock} mín.
                    </span>
                    <span className="text-[11px] font-bold text-accent">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={pct < 30 ? '#C85A3A' : '#C8763A'} height={4} />
                </div>
              )
            })
          )}

          {/* Quick link to AI */}
          <div className="px-5 py-3 border-t border-border">
            <Button
              className="w-full bg-gradient-to-br from-primary to-[#3A5A7A]"
              onClick={() => navigate('/asistente')}
            >
              ✦ Consultar al Asistente IA
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
