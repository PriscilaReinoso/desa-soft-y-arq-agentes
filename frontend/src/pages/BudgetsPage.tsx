import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { budgetStatusColor, lineItems as mockLineItems, presupuestos } from '../data/mock'
import { formatCurrency } from '../lib/format'
import type { Presupuesto, Renglon } from '../types/domain'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import PageHeader from '../components/ui/PageHeader'
import Select from '../components/ui/Select'

type BudgetHeaderForm = {
  cliente: string
  lista: string
  validez: string
  notas: string
}

const listColumns: Column<Presupuesto>[] = [
  {
    key: 'id',
    header: 'N° Pres.',
    mono: true,
    render: (b) => <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{b.id}</span>,
  },
  { key: 'client', header: 'Cliente', render: (b) => <span style={{ fontWeight: 600 }}>{b.client}</span> },
  {
    key: 'date',
    header: 'Fecha',
    render: (b) => <span style={{ color: 'var(--muted-foreground)' }}>{b.date}</span>,
  },
  {
    key: 'expiry',
    header: 'Vence',
    render: (b) => (
      <span
        style={{
          fontSize: 12,
          color: b.status === 'Vencido' ? '#C85A3A' : 'var(--muted-foreground)',
          fontWeight: b.status === 'Vencido' ? 700 : 400,
        }}
      >
        {b.expiry}
      </span>
    ),
  },
  {
    key: 'items',
    header: 'Artículos',
    render: (b) => <span style={{ color: 'var(--muted-foreground)' }}>{b.items}</span>,
  },
  {
    key: 'total',
    header: 'Total',
    mono: true,
    render: (b) => <span style={{ fontSize: 14, fontWeight: 800 }}>{formatCurrency(b.total)}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (b) => <Badge color={budgetStatusColor[b.status]}>{b.status}</Badge>,
  },
  {
    key: 'actions',
    header: '',
    render: () => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="outline" size="xs" type="button">
          Ver
        </Button>
        <Button variant="outline" size="xs" type="button" style={{ color: 'var(--accent)' }}>
          PDF
        </Button>
      </div>
    ),
  },
]

function BudgetCreate({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit } = useForm<BudgetHeaderForm>({
    defaultValues: { cliente: '', lista: 'Lista Minorista', validez: '15 días', notas: '' },
  })
  const [items, setItems] = useState<Renglon[]>(mockLineItems)

  const updateQty = (code: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) => (it.code === code ? { ...it, qty, subtotal: Math.round(it.price * qty) } : it)),
    )
  }

  const removeItem = (code: string) => {
    setItems((prev) => prev.filter((it) => it.code !== code))
  }

  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0)
  const iva = Math.round(subtotal * 0.21)
  const total = subtotal + iva

  const onSave = () => onBack()

  return (
    <div style={{ padding: '32px 36px', maxWidth: 820 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted-foreground)', padding: 0 }}
        >
          ←
        </button>
        <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Nuevo presupuesto</h1>
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          {/* Budget header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            <Field label="CLIENTE" htmlFor="budget-cliente">
              <Input id="budget-cliente" placeholder="Nombre del cliente" {...register('cliente')} />
            </Field>
            <Field label="LISTA DE PRECIOS" htmlFor="budget-lista">
              <Select id="budget-lista" {...register('lista')}>
                <option>Lista Minorista</option>
                <option>Lista Mayorista</option>
                <option>Lista Constructoras</option>
              </Select>
            </Field>
            <Field label="VALIDEZ" htmlFor="budget-validez">
              <Select id="budget-validez" {...register('validez')}>
                <option>15 días</option>
                <option>30 días</option>
                <option>60 días</option>
              </Select>
            </Field>
            <Field label="NOTAS" htmlFor="budget-notas">
              <Input id="budget-notas" placeholder="Observaciones opcionales" {...register('notas')} />
            </Field>
          </div>

          {/* Line items */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)' }}>
                {['Código', 'Artículo', 'Cantidad', 'Unidad', 'Precio unit.', 'Subtotal', ''].map((h) => (
                  <th
                    key={h}
                    style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.code} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--primary)' }}>
                    {item.code}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="number"
                      min={0}
                      value={item.qty}
                      onChange={(e) => updateQty(item.code, Number(e.target.value))}
                      style={{
                        width: 60,
                        padding: '5px 8px',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        fontFamily: 'inherit',
                        fontSize: 13,
                        outline: 'none',
                        textAlign: 'center',
                        background: 'var(--background)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>{item.unit}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatCurrency(item.price)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      type="button"
                      onClick={() => removeItem(item.code)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C85A3A', fontSize: 16 }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--border)' }}>
                <td colSpan={7} style={{ padding: '12px 16px' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: '1.5px dashed var(--border)',
                      borderRadius: 8,
                      padding: '7px 16px',
                      fontFamily: 'inherit',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--primary)',
                    }}
                  >
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
                { label: 'Subtotal', value: formatCurrency(subtotal) },
                { label: 'IVA 21%', value: formatCurrency(iva) },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid var(--foreground)', paddingTop: 8, marginTop: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary)' }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="submit">Guardar borrador</Button>
          <Button type="button" variant="accent">
            Exportar PDF
          </Button>
          <Button type="button" variant="muted" onClick={onBack}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function BudgetsPage() {
  const [view, setView] = useState<'list' | 'new'>('list')

  if (view === 'new') return <BudgetCreate onBack={() => setView('list')} />

  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader
        title="Presupuestos"
        subtitle="Preventas y presupuestos exportables a PDF"
        action={<Button variant="accent" onClick={() => setView('new')}>+ Nuevo presupuesto</Button>}
      />

      <DataTable columns={listColumns} rows={presupuestos} rowKey={(b) => b.id} cellPadding="13px 16px" />
    </div>
  )
}
