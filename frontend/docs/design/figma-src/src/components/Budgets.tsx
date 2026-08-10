import { useState } from 'react'

const budgets = [
  { id: 'P-0044', client: 'Constructora Norte S.A.', date: '08/08/2026', expiry: '22/08/2026', total: 48600, items: 18, status: 'Enviado' },
  { id: 'P-0043', client: 'Estudio Arquitectura Paz', date: '07/08/2026', expiry: '21/08/2026', total: 24300, items: 12, status: 'Aprobado' },
  { id: 'P-0042', client: 'Municipio de Rosario',     date: '05/08/2026', expiry: '19/08/2026', total: 112400, items: 45, status: 'Aprobado' },
  { id: 'P-0041', client: 'Juan Pérez',                date: '04/08/2026', expiry: '18/08/2026', total: 3800,  items: 4,  status: 'Vencido' },
  { id: 'P-0040', client: 'Electricidad Vera',         date: '01/08/2026', expiry: '15/08/2026', total: 31600, items: 22, status: 'Aprobado' },
]

const lineItems = [
  { code: 'B-001', name: 'Cable unipolar 2.5mm rojo', qty: 50, unit: 'mt.', price: 140, subtotal: 7000 },
  { code: 'B-002', name: 'Disyuntor bipolar 32A',      qty: 4,  unit: 'unid.', price: 1900, subtotal: 7600 },
  { code: 'A-002', name: 'Tornillo hex 3/8 x 2"',      qty: 200, unit: 'unid.', price: 40, subtotal: 8000 },
  { code: 'D-001', name: 'Martillo carpintero 20oz',   qty: 2, unit: 'unid.', price: 3400, subtotal: 6800 },
]

const statusColor: Record<string, string> = {
  Enviado: '#4A6B8A',
  Aprobado: '#7B9A4A',
  Vencido: '#C85A3A',
  Borrador: '#C8763A',
}

export default function Budgets() {
  const [view, setView] = useState<'list' | 'new'>('list')

  if (view === 'new') {
    const subtotal = lineItems.reduce((a, i) => a + i.subtotal, 0)
    const iva = Math.round(subtotal * 0.21)
    const total = subtotal + iva

    return (
      <div style={{ padding: '32px 36px', maxWidth: 820 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setView('list')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted-foreground)', padding: 0 }}
          >
            ←
          </button>
          <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Nuevo presupuesto</h1>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          {/* Budget header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>CLIENTE</label>
              <input placeholder="Nombre del cliente" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, outline: 'none', background: 'var(--background)' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>LISTA DE PRECIOS</label>
              <select style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--background)', outline: 'none' }}>
                <option>Lista Minorista</option>
                <option>Lista Mayorista</option>
                <option>Lista Constructoras</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>VALIDEZ</label>
              <select style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: 'var(--background)', outline: 'none' }}>
                <option>15 días</option>
                <option>30 días</option>
                <option>60 días</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>NOTAS</label>
              <input placeholder="Observaciones opcionales" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, outline: 'none', background: 'var(--background)' }} />
            </div>
          </div>

          {/* Line items */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)' }}>
                {['Código', 'Artículo', 'Cantidad', 'Unidad', 'Precio unit.', 'Subtotal', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={item.code} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)' }}>{item.code}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <input defaultValue={item.qty} style={{ width: 60, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, outline: 'none', textAlign: 'center' }} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>{item.unit}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>${item.price.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>${item.subtotal.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C85A3A', fontSize: 16 }}>✕</button>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--border)' }}>
                <td colSpan={7} style={{ padding: '12px 16px' }}>
                  <button style={{ background: 'none', border: '1.5px dashed var(--border)', borderRadius: 8, padding: '7px 16px', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}>
                    + Agregar artículo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 220 }}>
              {[
                { label: 'Subtotal', value: `$${subtotal.toLocaleString()}` },
                { label: 'IVA 21%', value: `$${iva.toLocaleString()}` },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid var(--foreground)', paddingTop: 8, marginTop: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary)' }}>
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '10px 24px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Guardar borrador
          </button>
          <button style={{ padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Exportar PDF
          </button>
          <button onClick={() => setView('list')} style={{ padding: '10px 24px', background: 'var(--muted)', border: 'none', borderRadius: 8, color: 'var(--foreground)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Presupuestos</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
            Preventas y presupuestos exportables a PDF
          </p>
        </div>
        <button
          onClick={() => setView('new')}
          style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          + Nuevo presupuesto
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--muted)' }}>
              {['N° Pres.', 'Cliente', 'Fecha', 'Vence', 'Artículos', 'Total', 'Estado', ''].map((h) => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {budgets.map((b, i) => (
              <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '13px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{b.id}</td>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600 }}>{b.client}</td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>{b.date}</td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: b.status === 'Vencido' ? '#C85A3A' : 'var(--muted-foreground)', fontWeight: b.status === 'Vencido' ? 700 : 400 }}>{b.expiry}</td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted-foreground)' }}>{b.items}</td>
                <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>${b.total.toLocaleString()}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: statusColor[b.status] + '18', color: statusColor[b.status] }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', color: 'var(--muted-foreground)' }}>Ver</button>
                    <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', color: 'var(--accent)' }}>PDF</button>
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
