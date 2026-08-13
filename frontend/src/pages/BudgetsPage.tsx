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
import PageContainer from '../components/ui/PageContainer'
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
    render: (b) => <span className="text-primary font-semibold">{b.id}</span>,
  },
  { key: 'client', header: 'Cliente', render: (b) => <span className="font-semibold">{b.client}</span> },
  {
    key: 'date',
    header: 'Fecha',
    render: (b) => <span className="text-muted-foreground">{b.date}</span>,
  },
  {
    key: 'expiry',
    header: 'Vence',
    render: (b) => (
      <span
        className={
          b.status === 'Vencido'
            ? 'text-xs text-danger font-bold'
            : 'text-xs text-muted-foreground font-normal'
        }
      >
        {b.expiry}
      </span>
    ),
  },
  {
    key: 'items',
    header: 'Artículos',
    render: (b) => <span className="text-muted-foreground">{b.items}</span>,
  },
  {
    key: 'total',
    header: 'Total',
    mono: true,
    render: (b) => <span className="text-[14px] font-extrabold">{formatCurrency(b.total)}</span>,
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
      <div className="flex gap-1.5">
        <Button variant="outline" size="xs" type="button">
          Ver
        </Button>
        <Button variant="outline" size="xs" type="button" className="text-accent">
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
    <PageContainer maxWidth={820}>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-transparent border-none cursor-pointer text-xl text-muted-foreground p-0"
        >
          ←
        </button>
        <h1 className="font-extrabold text-2xl m-0">Nuevo presupuesto</h1>
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
          {/* Budget header */}
          <div className="px-6 py-5 border-b border-border grid grid-cols-2 gap-4">
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                {['Código', 'Artículo', 'Cantidad', 'Unidad', 'Precio unit.', 'Subtotal', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.code} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs text-primary">
                    {item.code}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold">{item.name}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={item.qty}
                      onChange={(e) => updateQty(item.code, Number(e.target.value))}
                      className="w-[60px] px-2 py-[5px] border border-border rounded-md text-[13px] outline-none text-center bg-background"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-[13px] font-mono">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold font-mono">
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeItem(item.code)}
                      className="bg-transparent border-none cursor-pointer text-danger text-base"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <td colSpan={7} className="px-4 py-3">
                  <button
                    type="button"
                    className="bg-transparent border-[1.5px] border-dashed border-border rounded-lg px-4 py-[7px] text-xs font-semibold cursor-pointer text-primary"
                  >
                    + Agregar artículo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="px-6 py-4 border-t border-border flex justify-end">
            <div className="w-[220px]">
              {[
                { label: 'Subtotal', value: formatCurrency(subtotal) },
                { label: 'IVA 21%', value: formatCurrency(iva) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between mb-1.5">
                  <span className="text-[13px] text-muted-foreground">{row.label}</span>
                  <span className="text-[13px] font-mono">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between border-t-[1.5px] border-foreground pt-2 mt-1.5">
                <span className="font-extrabold text-[15px]">Total</span>
                <span className="font-extrabold text-lg font-mono text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <Button type="submit">Guardar borrador</Button>
          <Button type="button" variant="accent">
            Exportar PDF
          </Button>
          <Button type="button" variant="muted" onClick={onBack}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}

export default function BudgetsPage() {
  const [view, setView] = useState<'list' | 'new'>('list')

  if (view === 'new') return <BudgetCreate onBack={() => setView('list')} />

  return (
    <PageContainer>
      <PageHeader
        title="Presupuestos"
        subtitle="Preventas y presupuestos exportables a PDF"
        action={<Button variant="accent" onClick={() => setView('new')}>+ Nuevo presupuesto</Button>}
      />

      <DataTable columns={listColumns} rows={presupuestos} rowKey={(b) => b.id} cellPadding="13px 16px" />
    </PageContainer>
  )
}
