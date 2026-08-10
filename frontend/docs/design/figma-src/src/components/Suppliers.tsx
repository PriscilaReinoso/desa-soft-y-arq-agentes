import { useState } from 'react'

const suppliers = [
  { id: 'P-01', name: 'Distribuidora MetalSur', contact: 'Jorge Blanco', email: 'jblanco@metalsur.com', phone: '0341-4820011', categories: ['Fijaciones', 'Herramientas'], lastOrder: '02/08/2026', balance: -12400, rating: 5 },
  { id: 'P-02', name: 'Electro Insumos SRL',    contact: 'María Figueroa', email: 'mfigueroa@electroinsumos.com', phone: '011-4523-9900', categories: ['Electricidad'], lastOrder: '05/08/2026', balance: 0, rating: 4 },
  { id: 'P-03', name: 'Maderas del Litoral',    contact: 'Santiago Ríos', email: 'srios@maderlit.com', phone: '0342-4710083', categories: ['Maderas'], lastOrder: '28/07/2026', balance: -5200, rating: 4 },
  { id: 'P-04', name: 'Pinturas Acolore',       contact: 'Verónica Cruz', email: 'vcruz@acolore.com', phone: '011-4655-0012', categories: ['Pinturas'], lastOrder: '01/08/2026', balance: 0, rating: 5 },
  { id: 'P-05', name: 'Plomería Del Norte',     contact: 'Héctor Aguirre', email: 'haguirre@pldelnorte.com', phone: '0341-5520099', categories: ['Plomería'], lastOrder: '06/08/2026', balance: -3800, rating: 3 },
]

export default function Suppliers() {
  const [search, setSearch] = useState('')
  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Proveedores</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
            {suppliers.length} proveedores registrados
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
          + Nuevo proveedor
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar proveedor…"
        style={{
          padding: '9px 14px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontFamily: 'inherit',
          fontSize: 13,
          background: '#fff',
          width: 280,
          outline: 'none',
          marginBottom: 16,
          display: 'block',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((s) => (
          <div
            key={s.id}
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {s.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                    {s.contact} · {s.phone}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {s.categories.map((c) => (
                  <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', background: 'var(--secondary)', borderRadius: 99, color: 'var(--secondary-foreground)' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 2 }}>ÚLTIMO PEDIDO</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.lastOrder}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 2 }}>SALDO</div>
              <div style={{
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                color: s.balance < 0 ? '#C85A3A' : '#7B9A4A',
              }}>
                {s.balance < 0 ? `-$${Math.abs(s.balance).toLocaleString()}` : 'Al día'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <button style={{ padding: '7px 16px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Nuevo pedido
              </button>
              <button style={{ padding: '7px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Ver historial
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
