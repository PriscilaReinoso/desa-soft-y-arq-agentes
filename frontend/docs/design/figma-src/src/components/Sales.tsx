import { useState } from 'react'

const sales = [
  { id: 'V-0091', date: '09/08/2026', client: 'Constructora Norte S.A.', items: 14, total: 18400, status: 'Entregado', payment: 'Cuenta corriente' },
  { id: 'V-0090', date: '09/08/2026', client: 'Juan Pérez',               items: 3,  total: 2150,  status: 'Pendiente', payment: 'Efectivo' },
  { id: 'V-0089', date: '08/08/2026', client: 'Refaccionaria El Pinar',   items: 8,  total: 9800,  status: 'Entregado', payment: 'Transferencia' },
  { id: 'V-0088', date: '08/08/2026', client: 'Electricidad Vera',        items: 22, total: 31600, status: 'En camino', payment: 'Cuenta corriente' },
  { id: 'V-0087', date: '07/08/2026', client: 'Pablo Méndez',              items: 1,  total: 480,   status: 'Entregado', payment: 'Efectivo' },
  { id: 'V-0086', date: '07/08/2026', client: 'Municipio de Rosario',      items: 45, total: 68200, status: 'Entregado', payment: 'Cheque' },
  { id: 'V-0085', date: '06/08/2026', client: 'Estudio Arquitectura Paz',  items: 12, total: 24300, status: 'En camino', payment: 'Transferencia' },
]

const statusColor: Record<string, string> = {
  Entregado: '#7B9A4A',
  Pendiente: '#C8763A',
  'En camino': '#4A6B8A',
}

export default function Sales() {
  const [filter, setFilter] = useState('Todos')

  const filtered = filter === 'Todos' ? sales : sales.filter((s) => s.status === filter)

  const total = filtered.reduce((acc, s) => acc + s.total, 0)

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Ventas</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
            Total filtrado: <strong>${total.toLocaleString()}</strong>
          </p>
        </div>
        <button
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Nueva venta
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['Todos', 'Pendiente', 'En camino', 'Entregado'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '7px 16px',
              border: filter === s ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: 99,
              background: filter === s ? 'var(--primary)' : '#fff',
              color: filter === s ? '#fff' : 'var(--foreground)',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--muted)' }}>
              {['N° Venta', 'Fecha', 'Cliente', 'Artículos', 'Total', 'Pago', 'Estado', ''].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '11px 16px',
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
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '13px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                  {s.id}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>{s.date}</td>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600 }}>{s.client}</td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted-foreground)' }}>{s.items} art.</td>
                <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  ${s.total.toLocaleString()}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>{s.payment}</td>
                <td style={{ padding: '13px 16px' }}>
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
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                      Ver
                    </button>
                    <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}>
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
