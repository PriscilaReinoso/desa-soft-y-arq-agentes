const deposits = [
  {
    name: 'Depósito Principal',
    location: 'Planta baja, sector A',
    capacity: 85,
    items: 842,
    manager: 'Carlos Gómez',
    categories: ['Fijaciones', 'Plomería', 'Herramientas', 'Pinturas'],
  },
  {
    name: 'Depósito Eléctrico',
    location: 'Planta alta, sector B',
    capacity: 60,
    items: 234,
    manager: 'Laura Sánchez',
    categories: ['Electricidad', 'Iluminación'],
  },
  {
    name: 'Depósito Maderas',
    location: 'Galpón externo',
    capacity: 45,
    items: 98,
    manager: 'Roberto Díaz',
    categories: ['Maderas', 'Aberturas'],
  },
  {
    name: 'Depósito Pinturas',
    location: 'Planta baja, sector C',
    capacity: 70,
    items: 320,
    manager: 'Ana Torres',
    categories: ['Pinturas', 'Impermeabilizantes'],
  },
]

export default function Deposits() {
  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Depósitos</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>
            {deposits.length} depósitos activos
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
          + Nuevo depósito
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {deposits.map((d) => (
          <div
            key={d.name}
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>📍 {d.location}</div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: d.capacity > 70 ? '#C85A3A18' : '#7B9A4A18',
                  color: d.capacity > 70 ? '#C85A3A' : '#7B9A4A',
                  padding: '3px 10px',
                  borderRadius: 99,
                }}
              >
                {d.capacity}% ocupado
              </span>
            </div>

            {/* Capacity bar */}
            <div style={{ height: 6, background: 'var(--muted)', borderRadius: 99, marginBottom: 16 }}>
              <div
                style={{
                  height: '100%',
                  width: `${d.capacity}%`,
                  background: d.capacity > 70 ? '#C85A3A' : 'var(--primary)',
                  borderRadius: 99,
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={{ background: 'var(--muted)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary)' }}>
                  {d.items}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600 }}>artículos</div>
              </div>
              <div style={{ background: 'var(--muted)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{d.manager}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600 }}>responsable</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {d.categories.map((c) => (
                <span
                  key={c}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    background: 'var(--secondary)',
                    borderRadius: 99,
                    color: 'var(--secondary-foreground)',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: 8, background: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--foreground)' }}>
                Ver artículos
              </button>
              <button style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: 8, background: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--foreground)' }}>
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
