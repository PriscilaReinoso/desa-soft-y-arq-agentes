import { useState } from 'react'

const categories = ['Todos', 'Fijaciones', 'Electricidad', 'Plomería', 'Herramientas', 'Pinturas', 'Maderas']

const products = [
  { code: 'A-001', name: 'Tornillo autorroscante 1"', cat: 'Fijaciones',  stock: 42,   unit: 'unid.',  cost: 12,    price: 18,   deposit: 'Principal', min: 200 },
  { code: 'A-002', name: 'Tornillo hex 3/8 x 2"',     cat: 'Fijaciones',  stock: 380,  unit: 'unid.',  cost: 25,    price: 40,   deposit: 'Principal', min: 150 },
  { code: 'B-001', name: 'Cable unipolar 2.5mm rojo',  cat: 'Electricidad',stock: 12,   unit: 'mt.',    cost: 90,    price: 140,  deposit: 'Eléctrico', min: 50  },
  { code: 'B-002', name: 'Disyuntor bipolar 32A',      cat: 'Electricidad',stock: 24,   unit: 'unid.',  cost: 1200,  price: 1900, deposit: 'Eléctrico', min: 10  },
  { code: 'C-001', name: 'Cinta de teflón x 10m',      cat: 'Plomería',   stock: 8,    unit: 'unid.',  cost: 95,    price: 150,  deposit: 'Principal', min: 50  },
  { code: 'C-002', name: 'Caño de cobre 1/2" x 3m',    cat: 'Plomería',   stock: 60,   unit: 'unid.',  cost: 850,   price: 1250, deposit: 'Principal', min: 20  },
  { code: 'D-001', name: 'Martillo carpintero 20oz',    cat: 'Herramientas',stock: 15, unit: 'unid.',  cost: 2200,  price: 3400, deposit: 'Principal', min: 5   },
  { code: 'D-002', name: 'Lija grano 120 (pliego)',     cat: 'Herramientas',stock: 15, unit: 'unid.',  cost: 45,    price: 75,   deposit: 'Principal', min: 100 },
  { code: 'E-001', name: 'Pintura látex blanca 4L',     cat: 'Pinturas',   stock: 32,   unit: 'unid.',  cost: 2800,  price: 4200, deposit: 'Pinturas',  min: 10  },
  { code: 'F-001', name: 'Tablón pino 1" x 10" x 3m',  cat: 'Maderas',    stock: 18,   unit: 'unid.',  cost: 3500,  price: 5200, deposit: 'Maderas',   min: 8   },
]

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Todos')
  const [showForm, setShowForm] = useState(false)

  const filtered = products.filter((p) => {
    const matchCat = cat === 'Todos' || p.cat === cat
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Inventario</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
            {products.length} artículos registrados
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
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
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          + Nuevo artículo
        </button>
      </div>

      {/* New article form */}
      {showForm && (
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Agregar nuevo artículo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Código', placeholder: 'A-000' },
              { label: 'Nombre del artículo', placeholder: 'Ej: Tornillo 1"' },
              { label: 'Categoría', placeholder: 'Fijaciones' },
              { label: 'Stock actual', placeholder: '0' },
              { label: 'Stock mínimo', placeholder: '50' },
              { label: 'Unidad', placeholder: 'unid.' },
              { label: 'Costo ($)', placeholder: '0.00' },
              { label: 'Precio venta ($)', placeholder: '0.00' },
              { label: 'Depósito', placeholder: 'Principal' },
            ].map((f) => (
              <div key={f.label}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  placeholder={f.placeholder}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    background: 'var(--background)',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              style={{
                padding: '9px 20px',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Guardar
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '9px 20px',
                background: 'var(--muted)',
                border: 'none',
                borderRadius: 8,
                color: 'var(--foreground)',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código…"
          style={{
            padding: '9px 14px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontFamily: 'inherit',
            fontSize: 13,
            background: '#fff',
            width: 260,
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                padding: '7px 14px',
                border: cat === c ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 99,
                background: cat === c ? 'var(--primary)' : '#fff',
                color: cat === c ? '#fff' : 'var(--foreground)',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--muted)' }}>
              {['Código', 'Artículo', 'Categoría', 'Stock', 'Mín.', 'Depósito', 'Costo', 'P. Venta', 'Margen', ''].map((h) => (
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
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const margin = Math.round(((p.price - p.cost) / p.price) * 100)
              const isLow = p.stock < p.min
              return (
                <tr key={p.code} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                    {p.code}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>
                    {p.name}
                    {isLow && (
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#C85A3A', background: '#C85A3A18', padding: '1px 6px', borderRadius: 99 }}>
                        Bajo stock
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>{p.cat}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: isLow ? '#C85A3A' : 'var(--foreground)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.stock} {p.unit}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.min}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>{p.deposit}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                    ${p.cost.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    ${p.price.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: margin > 35 ? '#7B9A4A' : '#4A6B8A',
                      background: margin > 35 ? '#7B9A4A18' : '#4A6B8A18',
                      padding: '2px 8px',
                      borderRadius: 99,
                    }}>
                      {margin}%
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontFamily: 'inherit',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
