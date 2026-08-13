import { useMemo, useState } from 'react'
import { proveedores } from '../data/mock'
import { formatCurrencySigned } from '../lib/format'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageContainer from '../components/ui/PageContainer'
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
    <PageContainer>
      <PageHeader
        title="Proveedores"
        subtitle={`${proveedores.length} proveedores registrados`}
        action={<Button>+ Nuevo proveedor</Button>}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor…"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((s) => (
          <Card key={s.id} style={{ padding: '20px 24px' }}>
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Avatar name={s.name} size={36} />
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-[15px]">{s.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.contact} · {s.phone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {s.categories.map((c) => (
                    <Badge key={c} variant="subtle" style={{ padding: '2px 8px' }}>
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-[11px] text-muted-foreground font-semibold mb-0.5 uppercase">
                  ÚLTIMO PEDIDO
                </div>
                <div className="text-[13px] font-semibold">{s.lastOrder}</div>
              </div>

              <div className="text-center">
                <div className="text-[11px] text-muted-foreground font-semibold mb-0.5 uppercase">
                  SALDO
                </div>
                <div
                  className="text-sm font-extrabold font-mono"
                  style={{ color: s.balance < 0 ? '#C85A3A' : '#7B9A4A' }}
                >
                  {s.balance < 0 ? formatCurrencySigned(s.balance) : 'Al día'}
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <Button size="sm">Nuevo pedido</Button>
                <Button variant="outline" size="sm">
                  Ver historial
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
