import { useState } from 'react'
import { listasPrecios, priceListSample } from '../data/mock'
import { formatCurrency } from '../lib/format'
import type { ListaPrecios, Producto } from '../types/domain'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'

const previewColumns: Column<Producto>[] = [
  {
    key: 'code',
    header: 'Código',
    mono: true,
    render: (p) => <span style={{ color: 'var(--primary)' }}>{p.code}</span>,
  },
  { key: 'name', header: 'Artículo', render: (p) => <span style={{ fontWeight: 600 }}>{p.name}</span> },
  {
    key: 'base',
    header: 'Precio base',
    mono: true,
    render: (p) => <span style={{ color: 'var(--muted-foreground)' }}>{formatCurrency(p.base)}</span>,
  },
]

function PriceListCard({ list, selected, onToggle }: { list: ListaPrecios; selected: boolean; onToggle: () => void }) {
  const isSelected = selected
  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onToggle()
      }}
      style={{
        background: isSelected ? 'var(--primary)' : '#fff',
        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: isSelected ? '#fff' : 'var(--foreground)',
              marginBottom: 2,
            }}
          >
            {list.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)',
              marginBottom: 8,
            }}
          >
            {list.description}
          </div>
        </div>
        {!list.active && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: '#C8763A20',
              color: isSelected ? '#fff' : '#C8763A',
              padding: '2px 8px',
              borderRadius: 99,
            }}
          >
            Inactiva
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: isSelected ? '#fff' : 'var(--primary)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            x{list.multiplier.toFixed(2)}
          </div>
          <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)', fontWeight: 600 }}>
            multiplicador
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: isSelected ? '#fff' : 'var(--foreground)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {list.items}
          </div>
          <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)', fontWeight: 600 }}>
            artículos
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PriceListsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedList = listasPrecios.find((l) => l.id === selected) ?? null

  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader
        title="Listas de precios"
        subtitle="Gestioná los precios para cada tipo de cliente"
        action={<Button>+ Nueva lista</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* List cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listasPrecios.map((l) => (
            <PriceListCard
              key={l.id}
              list={l}
              selected={selected === l.id}
              onToggle={() => setSelected(selected === l.id ? null : l.id)}
            />
          ))}
        </div>

        {/* Preview */}
        {selectedList ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Vista previa — {selectedList.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  Actualizada el {selectedList.updated}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="muted" size="sm">
                  Editar multiplicador
                </Button>
                <Button variant="accent" size="sm">
                  Exportar PDF
                </Button>
              </div>
            </div>
            <DataTable
              columns={[
                ...previewColumns,
                {
                  key: 'price',
                  header: `Precio ${selectedList.name}`,
                  mono: true,
                  render: (p) => (
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(Math.round(p.base * selectedList.multiplier))}
                    </span>
                  ),
                },
              ]}
              rows={priceListSample}
              rowKey={(p) => p.code}
            />
          </div>
        ) : (
          <EmptyState icon="◷" message="Seleccioná una lista para ver el detalle" />
        )}
      </div>
    </div>
  )
}
