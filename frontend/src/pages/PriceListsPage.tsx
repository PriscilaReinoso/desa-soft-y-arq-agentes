import { useState } from 'react'
import { listasPrecios, priceListSample } from '../data/mock'
import { formatCurrency } from '../lib/format'
import type { ListaPrecios, Producto } from '../types/domain'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import PageContainer from '../components/ui/PageContainer'
import PageHeader from '../components/ui/PageHeader'

const previewColumns: Column<Producto>[] = [
  {
    key: 'code',
    header: 'Código',
    mono: true,
    render: (p) => <span className="text-primary">{p.code}</span>,
  },
  { key: 'name', header: 'Artículo', render: (p) => <span className="font-semibold">{p.name}</span> },
  {
    key: 'base',
    header: 'Precio base',
    mono: true,
    render: (p) => <span className="text-muted-foreground">{formatCurrency(p.base)}</span>,
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
      className={`px-[18px] py-4 cursor-pointer transition-all duration-150 rounded-xl border-[1.5px] ${
        isSelected ? 'bg-primary border-primary' : 'bg-card border-border'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className={`font-bold text-sm mb-0.5 ${isSelected ? 'text-white' : 'text-foreground'}`}>
            {list.name}
          </div>
          <div className={`text-xs mb-2 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
            {list.description}
          </div>
        </div>
        {!list.active && (
          <span
            className={`text-[10px] font-bold bg-[#C8763A20] rounded-full px-2 py-0.5 ${
              isSelected ? 'text-white' : 'text-accent'
            }`}
          >
            Inactiva
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <div>
          <div className={`text-lg font-extrabold font-mono ${isSelected ? 'text-white' : 'text-primary'}`}>
            x{list.multiplier.toFixed(2)}
          </div>
          <div className={`text-[10px] font-semibold ${isSelected ? 'text-white/60' : 'text-muted-foreground'}`}>
            multiplicador
          </div>
        </div>
        <div>
          <div className={`text-lg font-extrabold font-mono ${isSelected ? 'text-white' : 'text-foreground'}`}>
            {list.items}
          </div>
          <div className={`text-[10px] font-semibold ${isSelected ? 'text-white/60' : 'text-muted-foreground'}`}>
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
    <PageContainer>
      <PageHeader
        title="Listas de precios"
        subtitle="Gestioná los precios para cada tipo de cliente"
        action={<Button>+ Nueva lista</Button>}
      />

      <div className="grid grid-cols-[360px_1fr] gap-5 items-start">
        {/* List cards */}
        <div className="flex flex-col gap-2.5">
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
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div>
                <div className="font-bold text-[15px]">Vista previa — {selectedList.name}</div>
                <div className="text-xs text-muted-foreground">
                  Actualizada el {selectedList.updated}
                </div>
              </div>
              <div className="flex gap-2">
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
                    <span className="font-extrabold text-primary">
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
    </PageContainer>
  )
}
