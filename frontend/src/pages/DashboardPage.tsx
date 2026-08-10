import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { kpis, lowStock, mockUsuario, recentSales, statusColor } from '../data/mock'
import KpiCard from '../components/KpiCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const firstName = (usuario ?? mockUsuario).nombre

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0, color: 'var(--foreground)' }}>
          Buenos días, {firstName} 👋
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
          Resumen del día — sábado 9 de agosto de 2026
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent sales */}
        <Card>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>Ventas recientes</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/ventas')}>
              Ver todas →
            </Button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)' }}>
                {['N° Venta', 'Cliente', 'Artículos', 'Total', 'Estado'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 20px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s, i) => (
                <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                    {s.id}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600 }}>{s.client}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted-foreground)' }}>{s.items}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700 }}>{s.total}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <Badge color={statusColor[s.status]}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Low stock alert */}
        <Card>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>⚠️ Stock bajo mínimo</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')}>
              Ver →
            </Button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {lowStock.map((item, i) => {
              const pct = Math.round((item.stock / item.min) * 100)
              return (
                <div
                  key={item.name}
                  style={{ padding: '12px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {item.stock} {item.unit} de {item.min} mín.
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#C8763A' }}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={pct < 30 ? '#C85A3A' : '#C8763A'} height={4} />
                </div>
              )
            })}
          </div>

          {/* Quick link to AI */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <Button
              style={{ width: '100%', background: 'linear-gradient(135deg, #4A6B8A 0%, #3A5A7A 100%)' }}
              onClick={() => navigate('/asistente')}
            >
              ✦ Consultar al Asistente IA
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
