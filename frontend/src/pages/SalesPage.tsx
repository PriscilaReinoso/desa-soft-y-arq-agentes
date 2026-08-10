import { useMemo, useState } from 'react'
import { salesStatuses, statusColor, ventas } from '../data/mock'
import { formatCurrency } from '../lib/format'
import type { Venta } from '../types/domain'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import FilterPills from '../components/ui/FilterPills'
import PageHeader from '../components/ui/PageHeader'

const columns: Column<Venta>[] = [
  {
    key: 'id',
    header: 'N° Venta',
    mono: true,
    render: (s) => <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{s.id}</span>,
  },
  {
    key: 'date',
    header: 'Fecha',
    render: (s) => <span style={{ color: 'var(--muted-foreground)' }}>{s.date}</span>,
  },
  { key: 'client', header: 'Cliente', render: (s) => <span style={{ fontWeight: 600 }}>{s.client}</span> },
  {
    key: 'items',
    header: 'Artículos',
    render: (s) => <span style={{ color: 'var(--muted-foreground)' }}>{s.items} art.</span>,
  },
  {
    key: 'total',
    header: 'Total',
    mono: true,
    render: (s) => <span style={{ fontSize: 14, fontWeight: 800 }}>{formatCurrency(s.total)}</span>,
  },
  {
    key: 'payment',
    header: 'Pago',
    render: (s) => <span style={{ color: 'var(--muted-foreground)' }}>{s.payment}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (s) => <Badge color={statusColor[s.status]}>{s.status}</Badge>,
  },
  {
    key: 'actions',
    header: '',
    render: () => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="outline" size="xs" type="button">
          Ver
        </Button>
        <Button variant="outline" size="xs" type="button" style={{ color: 'var(--primary)' }}>
          PDF
        </Button>
      </div>
    ),
  },
]

export default function SalesPage() {
  const [filter, setFilter] = useState('Todos')

  const filtered = useMemo(
    () => (filter === 'Todos' ? ventas : ventas.filter((s) => s.status === filter)),
    [filter],
  )

  const total = filtered.reduce((acc, s) => acc + s.total, 0)

  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader
        title="Ventas"
        subtitle={
          <>
            Total filtrado: <strong>{formatCurrency(total)}</strong>
          </>
        }
        action={<Button variant="accent">+ Nueva venta</Button>}
      />

      <div style={{ marginBottom: 16 }}>
        <FilterPills options={salesStatuses} active={filter} onChange={setFilter} />
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(s) => s.id} cellPadding="13px 16px" />
    </div>
  )
}
