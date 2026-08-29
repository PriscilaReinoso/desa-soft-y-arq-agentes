import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/http'
import {
  useActualizarInventario,
  useAltaInventario,
  useEliminarInventario,
  useInventarios,
} from '../hooks/useInventarios'
import { useActualizarArticulo, useArticulos } from '../hooks/useArticulos'
import { useCategorias } from '../hooks/useCategorias'
import { useDepositos } from '../hooks/useDepositos'
import { useEspacios } from '../hooks/useEspacios'
import { useMedidas } from '../hooks/useMedidas'
import { useCrearVenta } from '../hooks/useVentas'
import { useMetodosPago } from '../hooks/useMetodosPago'
import { formatCurrency } from '../lib/format'
import type { InventarioAltaPayload, InventarioOut, InventarioRow } from '../types/domain'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import FilterPills from '../components/ui/FilterPills'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import PageContainer from '../components/ui/PageContainer'
import PageHeader from '../components/ui/PageHeader'
import SearchableSelect from '../components/ui/SearchableSelect'
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
  minimo_stock: number
  precio_venta: number
  medida_venta_id: string
}

type EditarFormValues = {
  articulo_nombre: string
  articulo_descripcion: string
  articulo_categoria_id: string
  medida_id: string
  espacio_id: string
  fila: number
  columna: number
  stock: number
  minimo_stock: number
  precio_venta: number
  medida_venta_id: string
}

type VentaFormValues = {
  cantidad: number
  cliente: string
  metodo_pago_id: string
  aprobado: boolean
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
    render: (r) =>
      r.bajo_minimo ? (
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: '#C85A3A' }}>
            {r.stock}
          </span>
          <Badge color="#C85A3A">Bajo stock</Badge>
        </div>
      ) : (
        <span className="font-bold">{r.stock}</span>
      ),
  },
  {
    key: 'minimo_stock',
    header: 'Mínimo',
    mono: true,
    render: (r) => <span className="text-muted-foreground">{r.minimo_stock}</span>,
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
    render: (r) => (
      <span className="font-bold">
        {formatCurrency(r.precio_venta)}
        {r.medida_venta ? ` / ${r.medida_venta}` : ''}
      </span>
    ),
  },
]

export default function InventoryPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'ADMIN'

  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InventarioOut | null>(null)
  const [ventaArticulo, setVentaArticulo] = useState<InventarioOut | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [articuloMode, setArticuloMode] = useState<'existente' | 'nuevo'>('existente')
  const [medidaMode, setMedidaMode] = useState<'existente' | 'nuevo'>('existente')
  const [espacioMode, setEspacioMode] = useState<'ninguno' | 'existente' | 'nuevo'>('ninguno')

  const inventariosQuery = useInventarios()
  const altaMutation = useAltaInventario()
  const actualizarMutation = useActualizarInventario()
  const actualizarArticuloMutation = useActualizarArticulo()
  const eliminarMutation = useEliminarInventario()
  const ventaMutation = useCrearVenta()
  const metodosQuery = useMetodosPago({ enabled: ventaArticulo !== null })
  const articulosQuery = useArticulos({ enabled: showForm })
  const categoriasQuery = useCategorias({ enabled: showForm || modalOpen })
  const medidasQuery = useMedidas({ enabled: showForm || modalOpen })
  const depositosQuery = useDepositos({ enabled: showForm || modalOpen })
  const espaciosQuery = useEspacios({ enabled: showForm || modalOpen })

  const {
    register,
    handleSubmit,
    control,
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
      minimo_stock: 0,
      precio_venta: 0,
      medida_venta_id: '',
    },
  })

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    control: controlEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditarFormValues>({
    defaultValues: {
      articulo_nombre: '',
      articulo_descripcion: '',
      articulo_categoria_id: '',
      medida_id: '',
      espacio_id: '',
      fila: 0,
      columna: 0,
      stock: 0,
      minimo_stock: 0,
      precio_venta: 0,
      medida_venta_id: '',
    },
  })

  const {
    register: registerVenta,
    handleSubmit: handleVentaSubmit,
    control: controlVenta,
    reset: resetVenta,
    formState: { errors: ventaErrors },
  } = useForm<VentaFormValues>({
    defaultValues: {
      cantidad: 0,
      cliente: '',
      metodo_pago_id: '',
      aprobado: true,
    },
  })

  const medidaOptions = useMemo(
    () =>
      (medidasQuery.data ?? []).map((m) => ({
        value: m.id,
        label: `${m.medida} ${m.unidad_medida}`.trim(),
      })),
    [medidasQuery.data],
  )

  const metodoPagoOptions = useMemo(
    () =>
      (metodosQuery.data ?? []).map((m) => ({
        value: m.id,
        label: m.nombre,
      })),
    [metodosQuery.data],
  )

  const rows = useMemo<InventarioRow[]>(
    () =>
      (inventariosQuery.data ?? []).map((inv) => ({
        id: inv.id,
        categoria: inv.articulo.categoria.nombre,
        articulo: inv.articulo.nombre,
        medida: `${inv.medida.medida} ${inv.medida.unidad_medida}`.trim(),
        deposito: inv.espacio?.deposito.nombre ?? null,
        espacio: inv.espacio ? inv.espacio.tipo ?? inv.espacio.descripcion ?? '' : null,
      fila: inv.fila,
      columna: inv.columna,
      stock: inv.stock,
      minimo_stock: inv.minimo_stock,
      medida_venta: inv.medida_venta
        ? `${inv.medida_venta.medida} ${inv.medida_venta.unidad_medida}`.trim()
        : null,
      bajo_minimo: inv.minimo_stock > 0 && inv.stock < inv.minimo_stock,
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

  const openEdit = (row: InventarioRow) => {
    const inv = inventariosQuery.data?.find((i) => i.id === row.id)
    if (!inv) return
    setEditing(inv)
    setSaveError(null)
    setSubmitting(false)
    resetEdit({
      articulo_nombre: inv.articulo.nombre,
      articulo_descripcion: inv.articulo.descripcion ?? '',
      articulo_categoria_id: inv.articulo.categoria.id,
      medida_id: inv.medida.id,
      espacio_id: inv.espacio?.id ?? '',
      fila: inv.fila ?? 0,
      columna: inv.columna ?? 0,
      stock: inv.stock,
      minimo_stock: inv.minimo_stock,
      precio_venta: Number(inv.precio_venta),
      medida_venta_id: inv.medida_venta?.id ?? '',
    })
    setModalOpen(true)
  }

  const closeEdit = () => {
    setModalOpen(false)
    setEditing(null)
    resetEdit()
  }

  const openVenta = (row: InventarioRow) => {
    const inv = inventariosQuery.data?.find((i) => i.id === row.id)
    if (!inv) return
    setVentaArticulo(inv)
    resetVenta({ cantidad: 0, cliente: '', metodo_pago_id: '', aprobado: true })
  }

  const closeVenta = () => {
    setVentaArticulo(null)
    resetVenta()
  }

  const onVentaSubmit = (values: VentaFormValues) => {
    if (!ventaArticulo) return
    ventaMutation.mutate(
      {
        items: [
          {
            inventario_id: ventaArticulo.id,
            cantidad: Number(values.cantidad),
            metodo_pago_id: values.metodo_pago_id || null,
          },
        ],
        aprobado: values.aprobado,
        cliente: values.cliente.trim() || null,
        presupuesto_id: null,
      },
      { onSuccess: closeVenta },
    )
  }

  const onEditSubmit = async (values: EditarFormValues) => {
    if (!editing) return
    setSubmitting(true)
    setSaveError(null)
    try {
      const articleChanged =
        values.articulo_nombre !== editing.articulo.nombre ||
        (values.articulo_descripcion ?? '') !== (editing.articulo.descripcion ?? '') ||
        values.articulo_categoria_id !== editing.articulo.categoria_id
      if (articleChanged) {
        await actualizarArticuloMutation.mutateAsync({
          id: editing.articulo.id,
          data: {
            nombre: values.articulo_nombre,
            descripcion: values.articulo_descripcion || null,
            categoria_id: values.articulo_categoria_id,
          },
        })
      }
      const payload = {
        medida_id: values.medida_id || undefined,
        espacio_id: values.espacio_id || null,
        fila: Number.isFinite(values.fila) ? values.fila : null,
        columna: Number.isFinite(values.columna) ? values.columna : null,
        stock: Number(values.stock),
        minimo_stock: Number(values.minimo_stock),
        precio_venta: Number(values.precio_venta),
        medida_venta_id: values.medida_venta_id || null,
      }
      await actualizarMutation.mutateAsync({ id: editing.id, data: payload })
      closeEdit()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminar = (row: InventarioRow) => {
    if (!window.confirm(`¿Eliminar "${row.articulo}" del inventario?`)) return
    eliminarMutation.mutate(row.id)
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
      minimo_stock: Number(values.minimo_stock),
      precio_venta: Number(values.precio_venta),
      medida_venta_id: values.medida_venta_id || null,
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

  const actualizarError = (() => {
    if (!actualizarMutation.error) return null
    return actualizarMutation.error instanceof ApiError
      ? actualizarMutation.error.message
      : actualizarMutation.error.message
  })()

  const eliminarError = (() => {
    if (!eliminarMutation.error) return null
    return eliminarMutation.error instanceof ApiError
      ? eliminarMutation.error.message
      : eliminarMutation.error.message
  })()

  const ventaError = (() => {
    if (!ventaMutation.error) return null
    return ventaMutation.error instanceof ApiError
      ? ventaMutation.error.message
      : ventaMutation.error.message
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

  const tableColumns: Column<InventarioRow>[] = [
    ...columns,
    {
      key: 'acciones',
      header: '',
      align: 'right',
      nowrap: true,
      render: (r) => (
        <div className="flex justify-end gap-1">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Editar ${r.articulo}`}
              onClick={() => openEdit(r)}
            >
              ✎
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Registrar venta de ${r.articulo}`}
            onClick={() => openVenta(r)}
          >
            🛒
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Eliminar ${r.articulo}`}
              onClick={() => handleEliminar(r)}
            >
              🗑
            </Button>
          )}
        </div>
      ),
    },
  ]

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
                    <Controller
                      control={control}
                      name="medida_id"
                      rules={{
                        validate: (v) =>
                          medidaMode === 'existente' && !v ? 'Seleccioná una medida' : true,
                      }}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          options={medidaOptions}
                          placeholder="Buscar medida…"
                        />
                      )}
                    />
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
            <Field label="Stock mínimo" error={errors.minimo_stock?.message}>
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...register('minimo_stock', {
                  valueAsNumber: true,
                  validate: (v) =>
                    !Number.isFinite(v) || v < 0 ? 'Debe ser mayor o igual a 0' : true,
                })}
              />
            </Field>
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
            <Field label="Medida de venta">
              <Controller
                control={control}
                name="medida_venta_id"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={medidaOptions}
                    placeholder="Buscar medida…"
                    optional
                    noneLabel="Sin medida"
                  />
                )}
              />
            </Field>
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

      {eliminarError && <Alert style={{ marginBottom: 16 }}>{eliminarError}</Alert>}

      <DataTable columns={tableColumns} rows={filtered} rowKey={(r) => r.id} />

      <Modal open={modalOpen} onClose={closeEdit} title="Editar artículo">
        {editing && (
          <form onSubmit={handleEditSubmit(onEditSubmit)} noValidate>
            <div className="rounded-lg border border-border p-3.5 mb-4">
              <div className="text-[13px] font-bold mb-2">Artículo</div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-full">
                  <Field label="Nombre" error={editErrors.articulo_nombre?.message}>
                    <Input {...registerEdit('articulo_nombre', { required: 'Ingresá un nombre' })} />
                  </Field>
                </div>
                <div className="col-span-full">
                  <Field label="Descripción">
                    <Input
                      placeholder="Descripción opcional"
                      {...registerEdit('articulo_descripcion')}
                    />
                  </Field>
                </div>
                <div className="col-span-full">
                  <Field label="Categoría" error={editErrors.articulo_categoria_id?.message}>
                    <Select
                      {...registerEdit('articulo_categoria_id', {
                        required: 'Seleccioná una categoría',
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
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="col-span-full">
                <Field label="Medida" error={editErrors.medida_id?.message}>
                  <Controller
                    control={controlEdit}
                    name="medida_id"
                    rules={{ required: 'Seleccioná una medida' }}
                    render={({ field }) => (
                      <SearchableSelect
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={medidaOptions}
                        placeholder="Buscar medida…"
                      />
                    )}
                  />
                </Field>
              </div>
              <div className="col-span-full">
                <Field label="Espacio">
                  <Select {...registerEdit('espacio_id')}>
                    <option value="">Sin espacio</option>
                    {(espaciosQuery.data ?? []).map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.tipo ?? e.descripcion ?? 'Espacio'}
                        {depositoName.get(e.deposito_id) ? ` — ${depositoName.get(e.deposito_id)}` : ''}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Fila">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...registerEdit('fila', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Columna">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...registerEdit('columna', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Stock" error={editErrors.stock?.message}>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...registerEdit('stock', {
                    valueAsNumber: true,
                    validate: (v) => (Number.isFinite(v) && v >= 0 ? true : 'Stock requerido'),
                  })}
                />
              </Field>
              <Field label="Stock mínimo" error={editErrors.minimo_stock?.message}>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...registerEdit('minimo_stock', {
                    valueAsNumber: true,
                    validate: (v) =>
                      !Number.isFinite(v) || v < 0 ? 'Debe ser mayor o igual a 0' : true,
                  })}
                />
              </Field>
              <Field label="Precio de venta ($)" error={editErrors.precio_venta?.message}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  {...registerEdit('precio_venta', {
                    valueAsNumber: true,
                    validate: (v) =>
                      Number.isFinite(v) && v >= 0 ? true : 'Precio de venta requerido',
                  })}
                />
              </Field>
              <Field label="Medida de venta">
                <Controller
                  control={controlEdit}
                  name="medida_venta_id"
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      options={medidaOptions}
                      placeholder="Buscar medida…"
                      optional
                      noneLabel="Sin medida"
                    />
                  )}
                />
              </Field>
            </div>

            {(saveError ?? actualizarError) && (
              <Alert style={{ marginTop: 14 }}>{saveError ?? actualizarError}</Alert>
            )}

            <div className="flex gap-2.5 mt-5 justify-end">
              <Button type="button" variant="muted" size="sm" onClick={closeEdit}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(ventaArticulo)} onClose={closeVenta} title="Registrar venta" width={480}>
        {ventaArticulo && (
          <form onSubmit={handleVentaSubmit(onVentaSubmit)} noValidate>
            <div className="rounded-lg border border-border p-3.5 mb-4">
              <div className="text-sm">
                <span className="font-bold">{ventaArticulo.articulo.nombre}</span>
                <span className="text-muted-foreground">
                  {' '}— {`${ventaArticulo.medida.medida} ${ventaArticulo.medida.unidad_medida}`.trim()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Stock disponible: <span className="font-bold text-foreground">{ventaArticulo.stock}</span>
              </div>
            </div>

            <div className="grid gap-3.5">
              <Field label="Cantidad vendida" error={ventaErrors.cantidad?.message}>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  placeholder="0"
                  {...registerVenta('cantidad', {
                    valueAsNumber: true,
                    validate: (v) =>
                      Number.isInteger(v) && v > 0 ? true : 'Ingresá una cantidad entera mayor a 0',
                  })}
                />
              </Field>
              <Field label="Cliente">
                <Input placeholder="Nombre del cliente (opcional)" {...registerVenta('cliente')} />
              </Field>
              <Field label="Tipo de pago">
                <Controller
                  control={controlVenta}
                  name="metodo_pago_id"
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      options={metodoPagoOptions}
                      placeholder="Buscar tipo de pago…"
                      optional
                      noneLabel="Sin tipo de pago"
                    />
                  )}
                />
              </Field>
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" {...registerVenta('aprobado')} />
                Venta aprobada
              </label>
            </div>

            {ventaError && (
              <Alert style={{ marginTop: 14 }}>{ventaError}</Alert>
            )}

            <div className="flex gap-2.5 mt-5 justify-end">
              <Button type="button" variant="muted" size="sm" onClick={closeVenta}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={ventaMutation.isPending}>
                {ventaMutation.isPending ? 'Registrando…' : 'Registrar venta'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  )
}
