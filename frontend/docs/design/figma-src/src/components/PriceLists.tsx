import { useState } from 'react'

const lists = [
  { id: 'L-1', name: 'Lista Minorista',      description: 'Clientes finales y particulares', multiplier: 1.0,  items: 420, updated: '01/08/2026', active: true },
  { id: 'L-2', name: 'Lista Mayorista',      description: 'Revendedores y comercios',         multiplier: 0.85, items: 420, updated: '01/08/2026', active: true },
  { id: 'L-3', name: 'Lista Constructoras',  description: 'Empresas con acuerdo de volumen',  multiplier: 0.78, items: 380, updated: '28/07/2026', active: true },
  { id: 'L-4', name: 'Lista Municipios',     description: 'Organismos estatales',              multiplier: 0.72, items: 200, updated: '15/07/2026', active: false },
]

const sampleProducts = [
  { code: 'A-001', name: 'Tornillo autorroscante 1"',  base: 18 },
  { code: 'B-002', name: 'Disyuntor bipolar 32A',       base: 1900 },
  { code: 'C-002', name: 'Caño de cobre 1/2" x 3m',    base: 1250 },
  { code: 'D-001', name: 'Martillo carpintero 20oz',    base: 3400 },
  { code: 'E-001', name: 'Pintura látex blanca 4L',     base: 4200 },
]

export default function PriceLists() {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedList = lists.find((l) => l.id === selected)

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Listas de precios</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
            Gestioná los precios para cada tipo de cliente
          </p>
        </div>
        <button
          style={{
            padding: '10px 20px',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Nueva lista
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* List cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lists.map((l) => (
            <div
              key={l.id}
              onClick={() => setSelected(l.id === selected ? null : l.id)}
              style={{
                background: selected === l.id ? 'var(--primary)' : '#fff',
                border: `1.5px solid ${selected === l.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: selected === l.id ? '#fff' : 'var(--foreground)', marginBottom: 2 }}>
                    {l.name}
                  </div>
                  <div style={{ fontSize: 12, color: selected === l.id ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)', marginBottom: 8 }}>
                    {l.description}
                  </div>
                </div>
                {!l.active && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#C8763A20', color: '#C8763A', padding: '2px 8px', borderRadius: 99 }}>
                    Inactiva
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: selected === l.id ? '#fff' : 'var(--primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                    x{l.multiplier.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: selected === l.id ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)', fontWeight: 600 }}>
                    multiplicador
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: selected === l.id ? '#fff' : 'var(--foreground)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {l.items}
                  </div>
                  <div style={{ fontSize: 10, color: selected === l.id ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)', fontWeight: 600 }}>
                    artículos
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        {selectedList ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Vista previa — {selectedList.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Actualizada el {selectedList.updated}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: '7px 14px', background: 'var(--muted)', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Editar multiplicador
                </button>
                <button style={{ padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Exportar PDF
                </button>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--muted)' }}>
                  {['Código', 'Artículo', 'Precio base', `Precio ${selectedList.name}`].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleProducts.map((p, i) => (
                  <tr key={p.code} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)' }}>{p.code}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: 'var(--muted-foreground)' }}>
                      ${p.base.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary)' }}>
                      ${Math.round(p.base * selectedList.multiplier).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◷</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Seleccioná una lista para ver el detalle</div>
          </div>
        )}
      </div>
    </div>
  )
}
