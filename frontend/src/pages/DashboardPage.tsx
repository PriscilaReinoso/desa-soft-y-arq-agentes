import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { kpis, lowStock, mockUsuario, recentSales, statusColor } from '../data/mock'
import KpiCard from '../components/KpiCard'
import PageContainer from '../components/ui/PageContainer'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const firstName = (usuario ?? mockUsuario).nombre

  return (
    <PageContainer maxWidth={1100}>
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-extrabold text-2xl m-0 text-foreground">
          Buenos días, {firstName} 👋
        </h1>
        <p className="mt-1 m-0 text-muted-foreground text-sm">
          Resumen del día — sábado 9 de agosto de 2026
        </p>
      </div>

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
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                {['N° Venta', 'Cliente', 'Artículos', 'Total', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2.5 text-left text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s, i) => (
                <tr key={s.id} className={i > 0 ? 'border-t border-border' : undefined}>
                  <td className="px-5 py-3 font-mono text-xs text-primary font-medium">
                    {s.id}
                  </td>
                  <td className="px-5 py-3 text-[13px] font-semibold">{s.client}</td>
                  <td className="px-5 py-3 text-[13px] text-muted-foreground">{s.items}</td>
                  <td className="px-5 py-3 text-[13px] font-bold">{s.total}</td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor[s.status]}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Low stock alert */}
        <Card>
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="font-bold text-[15px]">⚠️ Stock bajo mínimo</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')}>
              Ver →
            </Button>
          </div>
          <div className="py-2">
            {lowStock.map((item, i) => {
              const pct = Math.round((item.stock / item.min) * 100)
              return (
                <div
                  key={item.name}
                  className={`px-5 py-3 ${i > 0 ? 'border-t border-border' : undefined}`}
                >
                  <div className="font-semibold text-[13px] mb-1">{item.name}</div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      {item.stock} {item.unit} de {item.min} mín.
                    </span>
                    <span className="text-[11px] font-bold text-accent">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={pct < 30 ? '#C85A3A' : '#C8763A'} height={4} />
                </div>
              )
            })}
          </div>

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
