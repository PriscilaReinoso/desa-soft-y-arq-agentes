import type { Section } from '../App'

type Props = { onNavigate: (s: Section) => void }

const kpis = [
  { label: 'Artículos en stock',  value: '1.842',  delta: '+12 esta semana',  color: '#4A6B8A', icon: '📦' },
  { label: 'Ventas del mes',       value: '$284.500', delta: '+8% vs mes anterior', color: '#C8763A', icon: '💰' },
  { label: 'Órdenes pendientes',   value: '34',     delta: '6 vencen hoy',     color: '#A05C7B', icon: '🕐' },
  { label: 'Stock bajo mínimo',    value: '27',     delta: 'Requiere reposición', color: '#7B9A4A', icon: '⚠️' },
]

const recentSales = [
  { id: 'V-0091', client: 'Constructora Norte', items: 14, total: '$18.400', status: 'Entregado' },
  { id: 'V-0090', client: 'Juan Pérez',          items: 3,  total: '$2.150',  status: 'Pendiente' },
  { id: 'V-0089', client: 'Refac. El Pinar',     items: 8,  total: '$9.800',  status: 'Entregado' },
  { id: 'V-0088', client: 'Electricidad Vera',   items: 22, total: '$31.600', status: 'En camino' },
  { id: 'V-0087', client: 'Pablo Méndez',         items: 1,  total: '$480',    status: 'Entregado' },
]

const lowStock = [
  { name: 'Tornillo autorroscante 1"',  stock: 42,  min: 200, unit: 'unid.' },
  { name: 'Cinta de teflón x 10m',      stock: 8,   min: 50,  unit: 'unid.' },
  { name: 'Lija grano 120 (pliego)',     stock: 15,  min: 100, unit: 'unid.' },
  { name: 'Cable unipolar 2.5mm rojo',   stock: 12,  min: 50,  unit: 'mt.' },
]

const statusColor: Record<string, string> = {
  Entregado: '#7B9A4A',
  Pendiente: '#C8763A',
  'En camino': '#4A6B8A',
}

export default function Dashboard({ onNavigate }: Props) {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0, color: 'var(--foreground)' }}>
          Buenos días, Marcos 👋
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
          Resumen del día — sábado 9 de agosto de 2026
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '20px',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{kpi.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 26, color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {kpi.value}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--foreground)', marginTop: 2 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginTop: 4 }}>
              {kpi.delta}
            </div>
            <div
              style={{
                position: 'absolute',
                right: -10,
                top: -10,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: kpi.color,
                opacity: 0.07,
              }}
            />
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent sales */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
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
            <button
              onClick={() => onNavigate('sales')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ver todas →
            </button>
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
                <tr
                  key={s.id}
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                >
                  <td style={{ padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                    {s.id}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600 }}>{s.client}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted-foreground)' }}>{s.items}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700 }}>{s.total}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 99,
                        background: statusColor[s.status] + '18',
                        color: statusColor[s.status],
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low stock alert */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
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
            <button
              onClick={() => onNavigate('inventory')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ver →
            </button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {lowStock.map((item, i) => {
              const pct = Math.round((item.stock / item.min) * 100)
              return (
                <div
                  key={i}
                  style={{ padding: '12px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {item.stock} {item.unit} de {item.min} mín.
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#C8763A' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--muted)', borderRadius: 99 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: pct < 30 ? '#C85A3A' : '#C8763A',
                        borderRadius: 99,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick link to AI */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => onNavigate('assistant')}
              style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(135deg, #4A6B8A 0%, #3A5A7A 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              ✦ Consultar al Asistente IA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
