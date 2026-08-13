import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../services/http'
import { useAltaInventario, useInventarios } from '../hooks/useInventarios'
import { useArticulos } from '../hooks/useArticulos'
import { useCategorias } from '../hooks/useCategorias'
import { useDepositos } from '../hooks/useDepositos'
import { useEspacios } from '../hooks/useEspacios'
import { useMedidas } from '../hooks/useMedidas'
import { formatCurrency } from '../lib/format'
import type { InventarioAltaPayload, InventarioRow } from '../types/domain'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import FilterPills from '../components/ui/FilterPills'
import Input from '../components/ui/Input'
import PageContainer from '../components/ui/PageContainer'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Select from '../components/ui/Select'

type AltaFormValues = {
  articulo_id: string
  articulo_nombre: string
  articulo_categoria_id: string
  medida_id: string
  medida_unidad: string
  medida_valor: string
  espacio_id: string
  espacio_deposito_id: string
  fila: number
  columna: number
  stock: number
  precio_venta: number
}

const columns: Column<InventarioRow>[] = [
  {
    key: 'categoria',
    header: 'Categoría',
    render: (r) => <span className="text-muted-foreground">{r.categoria}</span>,
  },
  {
    key: 'articulo',
    header: 'Artículo',
    render: (r) => <span className="font-medium">{r.articulo}</span>,
  },
  {
    key: 'medida',
    header: 'Medida',
    render: (r) => <span className="text-muted-foreground">{r.medida}</span>,
  },
  {
    key: 'stock',
    header: 'Stock',
    mono: true,
    render: (r) => <span className="font-bold">{r.stock}</span>,
  },
  {
    key: 'ubicacion',
    header: 'Ubicación',
    render: (r) =>
      !r.deposito && !r.espacio ? (
        <span className="text-muted-foreground italic">Sin ubicación</span>
      ) : (
        <span className="text-muted-foreground">
          {r.deposito}
          {r.espacio ? ` · ${r.espacio}` : ''} · F{r.fila ?? '-'} C{r.columna ?? '-'}
        </span>
      ),
  },
  {
    key: 'precio_venta',
    header: 'P. Venta',
    mono: true,
    render: (r) => <span className="font-bold">{formatCurrency(r.precio_venta)}</span>,
  },
]

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  const [articuloMode, setArticuloMode] = useState<'existente' | 'nuevo'>('existente')
  const [medidaMode, setMedidaMode] = useState<'existente' | 'nuevo'>('existente')
  const [espacioMode, setEspacioMode] = useState<'ninguno' | 'existente' | 'nuevo'>('ninguno')

  const inventariosQuery = useInventarios()
  const altaMutation = useAltaInventario()
  const articulosQuery = useArticulos({ enabled: showForm })
  const categoriasQuery = useCategorias({ enabled: showForm })
  const medidasQuery = useMedidas({ enabled: showForm })
  const depositosQuery = useDepositos({ enabled: showForm })
  const espaciosQuery = useEspacios({ enabled: showForm })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AltaFormValues>({
    defaultValues: {
      articulo_id: '',
      articulo_nombre: '',
      articulo_categoria_id: '',
      medida_id: '',
      medida_unidad: '',
      medida_valor: '',
      espacio_id: '',
      espacio_deposito_id: '',
      fila: 0,
      columna: 0,
      stock: 0,
      precio_venta: 0,
    },
  })

  const rows = useMemo<InventarioRow[]>(
    () =>
      (inventariosQuery.data ?? []).map((inv) => ({
        id: inv.id,
        categoria: inv.articulo.categoria.nombre,
        articulo: inv.articulo.nombre,
        medida: `${inv.medida.unidad_medida} ${inv.medida.medida}`.trim(),
        deposito: inv.espacio?.deposito.nombre ?? null,
        espacio: inv.espacio ? inv.espacio.tipo ?? inv.espacio.descripcion ?? '' : null,
        fila: inv.fila,
        columna: inv.columna,
        stock: inv.stock,
        precio_venta: Number(inv.precio_venta),
      })),
    [inventariosQuery.data],
  )

  const categorias = useMemo(() => Array.from(new Set(rows.map((r) => r.categoria))), [rows])
  const categoryOptions = useMemo(() => ['Todos', ...categorias], [categorias])

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchCat = cat === 'Todos' || r.categoria === cat
        const term = search.toLowerCase()
        const matchSearch =
          r.articulo.toLowerCase().includes(term) || r.categoria.toLowerCase().includes(term)
        return matchCat && matchSearch
      }),
    [rows, cat, search],
  )

  const depositoName = useMemo(
    () => new Map((depositosQuery.data ?? []).map((d) => [d.id, d.nombre])),
    [depositosQuery.data],
  )

  const closeForm = () => {
    setShowForm(false)
    reset()
  }

  const onSubmit = (values: AltaFormValues) => {
    const payload: InventarioAltaPayload = {
      articulo:
        articuloMode === 'existente'
          ? { id: values.articulo_id }
          : { nombre: values.articulo_nombre, categoria_id: values.articulo_categoria_id },
      medida:
        medidaMode === 'existente'
          ? { id: values.medida_id }
          : { unidad_medida: values.medida_unidad, medida: values.medida_valor },
      espacio:
        espacioMode === 'ninguno'
          ? null
          : espacioMode === 'existente'
            ? { id: values.espacio_id }
            : { deposito_id: values.espacio_deposito_id },
      fila: values.fila || null,
      columna: values.columna || null,
      stock: Number(values.stock),
      precio_venta: Number(values.precio_venta),
    }
    altaMutation.mutate(payload, {
      onSuccess: () => closeForm(),
    })
  }

  const inventarioError = (() => {
    if (!inventariosQuery.error) return null
    return inventariosQuery.error instanceof ApiError
      ? inventariosQuery.error.message
      : inventariosQuery.error.message
  })()

  const altaError = (() => {
    if (!altaMutation.error) return null
    return altaMutation.error instanceof ApiError
      ? altaMutation.error.message
      : altaMutation.error.message
  })()

  const maestroError = (() => {
    const queries = [articulosQuery, categoriasQuery, medidasQuery, depositosQuery, espaciosQuery]
    const failed = queries.find((q) => q.isError)
    if (!failed?.error) return null
    return failed.error instanceof ApiError ? failed.error.message : failed.error.message
  })()

  if (inventariosQuery.isPending) {
    return (
      <PageContainer>
        <EmptyState message="Cargando inventario…" />
      </PageContainer>
    )
  }

  if (inventariosQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="Inventario" subtitle="No se pudo cargar el inventario desde el servidor" />
        <Alert size="md">{inventarioError}</Alert>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Inventario"
        subtitle={`${rows.length} artículos registrados`}
        action={
          <Button onClick={() => setShowForm((v) => !v)}>+ Nuevo artículo</Button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-card border border-border rounded-xl p-6 mb-5"
        >
          <h3 className="m-0 mb-4 font-bold">Agregar nuevo artículo</h3>

          {maestroError && (
            <Alert style={{ marginBottom: 16 }}>{maestroError}</Alert>
          )}

          <div className="grid grid-cols-3 gap-3.5">
            {/* Artículo */}
            <div className="col-span-full border-b border-border pb-1">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className="text-[13px] font-bold">Artículo</span>
                <FilterPills
                  options={[
                    { value: 'existente', label: 'Existente' },
                    { value: 'nuevo', label: 'Nuevo' },
                  ]}
                  active={articuloMode}
                  onChange={(v) => setArticuloMode(v as 'existente' | 'nuevo')}
                />
              </div>
              <div className={`grid gap-3.5 mt-2.5 ${articuloMode === 'existente' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {articuloMode === 'existente' ? (
                  <Field label="Artículo" error={errors.articulo_id?.message}>
                    <Select
                      {...register('articulo_id', {
                        validate: (v) => (articuloMode === 'existente' && !v ? 'Seleccioná un artículo' : true),
                      })}
                    >
                      <option value="">Seleccionar…</option>
                      {(articulosQuery.data ?? []).map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : (
                  <>
                    <Field label="Nombre del artículo" error={errors.articulo_nombre?.message}>
                      <Input
                        placeholder='Ej: Tornillo 1"'
                        {...register('articulo_nombre', {
                          validate: (v) => (articuloMode === 'nuevo' && !v ? 'Nombre requerido' : true),
                        })}
                      />
                    </Field>
                    <Field label="Categoría" error={errors.articulo_categoria_id?.message}>
                      <Select
                        {...register('articulo_categoria_id', {
                          validate: (v) => (articuloMode === 'nuevo' && !v ? 'Categoría requerida' : true),
                        })}
                      >
                        <option value="">Seleccionar…</option>
                        {(categoriasQuery.data ?? []).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </>
                )}
              </div>
            </div>

            {/* Medida */}
            <div className="col-span-full border-b border-border pb-1">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className="text-[13px] font-bold">Medida</span>
                <FilterPills
                  options={[
                    { value: 'existente', label: 'Existente' },
                    { value: 'nuevo', label: 'Nueva' },
                  ]}
                  active={medidaMode}
                  onChange={(v) => setMedidaMode(v as 'existente' | 'nuevo')}
                />
              </div>
              <div className={`grid gap-3.5 mt-2.5 ${medidaMode === 'existente' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {medidaMode === 'existente' ? (
                  <Field label="Medida" error={errors.medida_id?.message}>
                    <Select
                      {...register('medida_id', {
                        validate: (v) => (medidaMode === 'existente' && !v ? 'Seleccioná una medida' : true),
                      })}
                    >
                      <option value="">Seleccionar…</option>
                      {(medidasQuery.data ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.unidad_medida} {m.medida}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : (
                  <>
                    <Field label="Unidad" error={errors.medida_unidad?.message}>
                      <Input
                        placeholder="Ej: pulgada"
                        {...register('medida_unidad', {
                          validate: (v) => (medidaMode === 'nuevo' && !v ? 'Unidad requerida' : true),
                        })}
                      />
                    </Field>
                    <Field label="Medida" error={errors.medida_valor?.message}>
                      <Input
                        placeholder="Ej: 1/2"
                        {...register('medida_valor', {
                          validate: (v) => (medidaMode === 'nuevo' && !v ? 'Medida requerida' : true),
                        })}
                      />
                    </Field>
                  </>
                )}
              </div>
            </div>

            {/* Espacio (opcional) */}
            <div className="col-span-full border-b border-border pb-1">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className="text-[13px] font-bold">Espacio</span>
                <FilterPills
                  options={[
                    { value: 'ninguno', label: 'Sin espacio' },
                    { value: 'existente', label: 'Existente' },
                    { value: 'nuevo', label: 'Nuevo' },
                  ]}
                  active={espacioMode}
                  onChange={(v) => setEspacioMode(v as 'ninguno' | 'existente' | 'nuevo')}
                />
              </div>
              {espacioMode !== 'ninguno' && (
                <div className="mt-2.5">
                  {espacioMode === 'existente' ? (
                    <Field label="Espacio" error={errors.espacio_id?.message}>
                      <Select
                        {...register('espacio_id', {
                          validate: (v) => (espacioMode === 'existente' && !v ? 'Seleccioná un espacio' : true),
                        })}
                      >
                        <option value="">Seleccionar…</option>
                        {(espaciosQuery.data ?? []).map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.tipo ?? e.descripcion ?? 'Espacio'}
                            {depositoName.get(e.deposito_id) ? ` — ${depositoName.get(e.deposito_id)}` : ''}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  ) : (
                    <Field label="Depósito" error={errors.espacio_deposito_id?.message}>
                      <Select
                        {...register('espacio_deposito_id', {
                          validate: (v) => (espacioMode === 'nuevo' && !v ? 'Seleccioná un depósito' : true),
                        })}
                      >
                        <option value="">Seleccionar…</option>
                        {(depositosQuery.data ?? []).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  )}
                </div>
              )}
            </div>

            <Field label="Fila">
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...register('fila', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Columna">
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...register('columna', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Stock" error={errors.stock?.message}>
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...register('stock', {
                  valueAsNumber: true,
                  validate: (v) => (Number.isFinite(v) && v >= 0 ? true : 'Stock requerido'),
                })}
              />
            </Field>
            <div className="col-span-full">
              <Field label="Precio de venta ($)" error={errors.precio_venta?.message}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  {...register('precio_venta', {
                    valueAsNumber: true,
                    validate: (v) => (Number.isFinite(v) && v >= 0 ? true : 'Precio de venta requerido'),
                  })}
                />
              </Field>
            </div>
          </div>

          {altaError && (
            <Alert style={{ marginTop: 14 }}>{altaError}</Alert>
          )}

          <div className="flex gap-2.5 mt-4">
            <Button type="submit" size="sm" disabled={altaMutation.isPending}>
              {altaMutation.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button type="button" variant="muted" size="sm" onClick={closeForm}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="flex gap-3 mb-4 items-center flex-wrap">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o categoría…"
        />
        <FilterPills options={categoryOptions} active={cat} onChange={setCat} />
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} />
    </PageContainer>
  )
}
