import { useMemo, useState } from 'react'
import { proveedores } from '../data/mock'
import { formatCurrencySigned } from '../lib/format'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'

export default function SuppliersPage() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      proveedores.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.contact.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  )

  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader
        title="Proveedores"
        subtitle={`${proveedores.length} proveedores registrados`}
        action={<Button>+ Nuevo proveedor</Button>}
      />

      <div style={{ marginBottom: 16 }}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor…"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((s) => (
          <Card key={s.id} style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <Avatar name={s.name} size={36} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                    {s.contact} · {s.phone}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {s.categories.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      background: 'var(--secondary)',
                      borderRadius: 99,
                      color: 'var(--secondary-foreground)',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 2 }}>
                ÚLTIMO PEDIDO
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.lastOrder}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 2 }}>
                SALDO
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: s.balance < 0 ? '#C85A3A' : '#7B9A4A',
                }}
              >
                {s.balance < 0 ? formatCurrencySigned(s.balance) : 'Al día'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <Button size="sm">Nuevo pedido</Button>
              <Button variant="outline" size="sm">
                Ver historial
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
