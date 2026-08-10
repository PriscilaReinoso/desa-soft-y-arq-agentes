import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { productCategories, products as mockProducts } from '../data/mock'
import { calculateMargin, formatCurrency } from '../lib/format'
import type { ArticuloItem } from '../types/domain'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import Field from '../components/ui/Field'
import FilterPills from '../components/ui/FilterPills'
import Input from '../components/ui/Input'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Select from '../components/ui/Select'

type ArticuloFormValues = {
  code: string
  name: string
  cat: string
  stock: number
  min: number
  unit: string
  cost: number
  price: number
  deposit: string
}

const columns: Column<ArticuloItem>[] = [
  {
    key: 'code',
    header: 'Código',
    mono: true,
    render: (p) => <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{p.code}</span>,
  },
  {
    key: 'name',
    header: 'Artículo',
    render: (p) => (
      <>
        {p.name}
        {p.stock < p.min && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 10,
              fontWeight: 700,
              color: '#C85A3A',
              background: '#C85A3A18',
              padding: '1px 6px',
              borderRadius: 99,
            }}
          >
            Bajo stock
          </span>
        )}
      </>
    ),
  },
  {
    key: 'cat',
    header: 'Categoría',
    render: (p) => <span style={{ color: 'var(--muted-foreground)' }}>{p.cat}</span>,
  },
  {
    key: 'stock',
    header: 'Stock',
    mono: true,
    render: (p) => (
      <span style={{ color: p.stock < p.min ? '#C85A3A' : 'var(--foreground)', fontWeight: 700 }}>
        {p.stock} {p.unit}
      </span>
    ),
  },
  {
    key: 'min',
    header: 'Mín.',
    mono: true,
    render: (p) => <span style={{ color: 'var(--muted-foreground)' }}>{p.min}</span>,
  },
  {
    key: 'deposit',
    header: 'Depósito',
    render: (p) => <span style={{ color: 'var(--muted-foreground)' }}>{p.deposit}</span>,
  },
  { key: 'cost', header: 'Costo', mono: true, render: (p) => formatCurrency(p.cost) },
  {
    key: 'price',
    header: 'P. Venta',
    mono: true,
    render: (p) => <span style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</span>,
  },
  {
    key: 'margin',
    header: 'Margen',
    render: (p) => {
      const margin = calculateMargin(p.price, p.cost)
      const color = margin > 35 ? '#7B9A4A' : '#4A6B8A'
      return (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color,
            background: `${color}18`,
            padding: '2px 8px',
            borderRadius: 99,
          }}
        >
          {margin}%
        </span>
      )
    },
  },
  {
    key: 'edit',
    header: '',
    render: () => (
      <Button variant="outline" size="xs" type="button">
        Editar
      </Button>
    ),
  },
]

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  const [items, setItems] = useState<ArticuloItem[]>(mockProducts)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ArticuloFormValues>({
    defaultValues: {
      code: '',
      name: '',
      cat: 'Fijaciones',
      stock: 0,
      min: 50,
      unit: 'unid.',
      cost: 0,
      price: 0,
      deposit: 'Principal',
    },
  })

  const filtered = useMemo(
    () =>
      items.filter((p) => {
        const matchCat = cat === 'Todos' || p.cat === cat
        const term = search.toLowerCase()
        const matchSearch = p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
        return matchCat && matchSearch
      }),
    [items, cat, search],
  )

  const onSubmit = (values: ArticuloFormValues) => {
    const nuevo: ArticuloItem = {
      code: values.code,
      name: values.name,
      cat: values.cat,
      stock: Number(values.stock),
      min: Number(values.min),
      unit: values.unit,
      cost: Number(values.cost),
      price: Number(values.price),
      deposit: values.deposit,
    }
    setItems((prev) => [nuevo, ...prev])
    setShowForm(false)
    reset()
  }

  const categoriesForSelect = productCategories.filter((c) => c !== 'Todos')

  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader
        title="Inventario"
        subtitle={`${items.length} artículos registrados`}
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            + Nuevo artículo
          </Button>
        }
      />

      {/* New article form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
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
            <div>
              <Field label="Código">
                <Input placeholder="A-000" {...register('code', { required: 'Código requerido' })} />
              </Field>
              {errors.code && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#C85A3A' }}>{errors.code.message}</p>}
            </div>
            <div>
              <Field label="Nombre del artículo">
                <Input placeholder='Ej: Tornillo 1"' {...register('name', { required: 'Nombre requerido' })} />
              </Field>
              {errors.name && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#C85A3A' }}>{errors.name.message}</p>}
            </div>
            <div>
              <Field label="Categoría">
                <Select {...register('cat')}>
                  {categoriesForSelect.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div>
              <Field label="Stock actual">
                <Input type="number" placeholder="0" {...register('stock', { valueAsNumber: true })} />
              </Field>
            </div>
            <div>
              <Field label="Stock mínimo">
                <Input type="number" placeholder="50" {...register('min', { valueAsNumber: true })} />
              </Field>
            </div>
            <div>
              <Field label="Unidad">
                <Input placeholder="unid." {...register('unit')} />
              </Field>
            </div>
            <div>
              <Field label="Costo ($)">
                <Input type="number" placeholder="0.00" step="0.01" {...register('cost', { valueAsNumber: true })} />
              </Field>
            </div>
            <div>
              <Field label="Precio venta ($)">
                <Input type="number" placeholder="0.00" step="0.01" {...register('price', { valueAsNumber: true })} />
              </Field>
            </div>
            <div>
              <Field label="Depósito">
                <Input placeholder="Principal" {...register('deposit')} />
              </Field>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button type="submit" size="sm">
              Guardar
            </Button>
            <Button
              type="button"
              variant="muted"
              size="sm"
              onClick={() => {
                setShowForm(false)
                reset()
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código…"
        />
        <FilterPills options={productCategories} active={cat} onChange={setCat} />
      </div>

      {/* Table */}
      <DataTable columns={columns} rows={filtered} rowKey={(p) => p.code} />
    </div>
  )
}
