import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useFieldArray, useForm, useWatch, type FieldErrors } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/http'
import {
  useActualizarListaPrecio,
  useCantidadListasPorProveedor,
  useCrearListaPrecios,
  useCrearListaPreciosExcel,
  useEliminarListaPrecio,
  useListasPrecios,
} from '../hooks/useListasPrecios'
import { useArticulos } from '../hooks/useArticulos'
import { useCategorias } from '../hooks/useCategorias'
import { useMedidas } from '../hooks/useMedidas'
import { useProveedores } from '../hooks/useProveedores'
import { formatCurrency } from '../lib/format'
import { readExcelColumns, type ExcelColumn } from '../lib/excelHeaders'
import type {
  ListaPrecioOut,
  ListaPreciosAltaPayload,
  MapeoColumna,
  Proveedor,
} from '../types/domain'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import DataTable, { type Column } from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import FilterPills from '../components/ui/FilterPills'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import PageContainer from '../components/ui/PageContainer'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import SearchableSelect from '../components/ui/SearchableSelect'

const MAPEO_KEYS = [
  'articulo_id',
  'nombre',
  'articulo_medida_combinado',
  'descripcion',
  'categoria',
  'medida_id',
  'unidad_medida',
  'medida',
  'id_articulo_proveedor',
  'precio_lista',
]

const MAPEO_REQUERIDOS = [
  'articulo: "nombre" o "articulo_id"',
  'medida: "unidad_medida" y "medida" juntas o "medida_id"',
  'alternativa única para artículo y medida: "articulo_medida_combinado"',
  'precio_lista',
]

const MAPEO_ALIASES: Record<string, string[]> = {
  articulo_id: ['articulo_id', 'id_articulo', 'id'],
  nombre: ['nombre', 'articulo', 'artículo', 'producto', 'descripcion corta'],
  articulo_medida_combinado: [
    'articulo_medida_combinado',
    'artículo y medida',
    'articulo y medida',
    'artículo con medida',
    'articulo con medida',
  ],
  descripcion: ['descripcion', 'descripción'],
  categoria: ['categoria', 'categoría', 'rubro', 'familia'],
  medida_id: ['medida_id', 'id_medida'],
  unidad_medida: ['unidad_medida', 'unidad'],
  medida: ['medida'],
  id_articulo_proveedor: [
    'id_articulo_proveedor',
    'codigo',
    'código',
    'codigo_proveedor',
    'cod_proveedor',
    'codigo articulo proveedor',
  ],
  precio_lista: ['precio_lista', 'precio', 'precio de lista', 'precio unitario', 'costo'],
}

const normalizeHeader = (value: string) => value.trim().toLowerCase()

const ITEMS_POR_PAGINA = 10

function autoMapear(columns: ExcelColumn[]): MapeoColumna[] {
  const result: MapeoColumna[] = []
  const usados = new Set<string>()
  for (const key of MAPEO_KEYS) {
    const aliases = MAPEO_ALIASES[key] ?? [key]
    const col = columns.find(
      (c) => !usados.has(c.header) && aliases.includes(normalizeHeader(c.header)),
    )
    if (col) {
      usados.add(col.header)
      result.push({ key, value: col.header })
    }
  }
  return result
}

const proveedorLabel = (p: Pick<Proveedor, 'nombre' | 'apellido'>) =>
  [p.nombre, p.apellido].filter(Boolean).join(' ').trim()

const medidaLabel = (m: { medida: string; unidad_medida: string }) =>
  `${m.medida} ${m.unidad_medida}`.trim()

type ModoEntidad = 'existente' | 'nuevo'

type ItemAltaForm = {
  articulo_modo: ModoEntidad
  articulo_id: string
  articulo_nombre: string
  articulo_categoria_id: string
  articulo_descripcion: string
  medida_modo: ModoEntidad
  medida_id: string
  medida_unidad: string
  medida_texto: string
  precio_lista: number
  id_articulo_proveedor: string
}

const itemVacio = (): ItemAltaForm => ({
  articulo_modo: 'existente',
  articulo_id: '',
  articulo_nombre: '',
  articulo_categoria_id: '',
  articulo_descripcion: '',
  medida_modo: 'existente',
  medida_id: '',
  medida_unidad: '',
  medida_texto: '',
  precio_lista: 0,
  id_articulo_proveedor: '',
})

type AltaFormValues = {
  proveedor_id: string
  proveedor_nombre: string
  proveedor_apellido: string
  proveedor_telefono: string
  proveedor_direccion: string
  items: ItemAltaForm[]
}

type ExcelFormValues = {
  proveedor_id: string
  proveedor_nombre: string
  proveedor_apellido: string
  proveedor_telefono: string
  proveedor_direccion: string
}

type EditFormValues = {
  precio_lista: number
  id_articulo_proveedor: string
}

export default function PriceListsPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'ADMIN'

  const [search, setSearch] = useState('')
  const [categoriasFiltro, setCategoriasFiltro] = useState<string[]>([])
  const [selectedProveedorId, setSelectedProveedorId] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)

  const [altaOpen, setAltaOpen] = useState(false)
  const [excelOpen, setExcelOpen] = useState(false)
  const [editItem, setEditItem] = useState<ListaPrecioOut | null>(null)

  useEffect(() => {
    setPaginaActual(1)
  }, [selectedProveedorId, categoriasFiltro])

  const skip = (paginaActual - 1) * ITEMS_POR_PAGINA

  const cantidadQuery = useCantidadListasPorProveedor()
  const detalleQuery = useListasPrecios(
    {
      proveedor_id: selectedProveedorId ?? undefined,
      categoria_ids: categoriasFiltro,
      skip,
      limit: ITEMS_POR_PAGINA,
    },
    { enabled: Boolean(selectedProveedorId) },
  )
  const proveedoresQuery = useProveedores()
  const categoriasQuery = useCategorias()
  const articulosQuery = useArticulos({ enabled: altaOpen })
  const medidasQuery = useMedidas({ enabled: altaOpen })

  const crearMutation = useCrearListaPrecios()
  const excelMutation = useCrearListaPreciosExcel()
  const actualizarMutation = useActualizarListaPrecio()
  const eliminarMutation = useEliminarListaPrecio()

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<AltaFormValues>({
    defaultValues: {
      proveedor_id: '',
      proveedor_nombre: '',
      proveedor_apellido: '',
      proveedor_telefono: '',
      proveedor_direccion: '',
      items: [itemVacio()],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const itemsWatch = useWatch({ control, name: 'items' })

  const excelForm = useForm<ExcelFormValues>({
    defaultValues: {
      proveedor_id: '',
      proveedor_nombre: '',
      proveedor_apellido: '',
      proveedor_telefono: '',
      proveedor_direccion: '',
    },
  })
  const {
    register: registerExcel,
    handleSubmit: handleExcelSubmit,
    reset: resetExcel,
    formState: { errors: excelErrors },
  } = excelForm

  const editForm = useForm<EditFormValues>({
    defaultValues: { precio_lista: 0, id_articulo_proveedor: '' },
  })
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = editForm

  const [proveedorMode, setProveedorMode] = useState<'existente' | 'nuevo'>('existente')
  const [excelProveedorMode, setExcelProveedorMode] = useState<'existente' | 'nuevo'>('existente')
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [mapeo, setMapeo] = useState<MapeoColumna[]>([])
  const [excelColumns, setExcelColumns] = useState<ExcelColumn[] | null>(null)
  const [excelReading, setExcelReading] = useState(false)
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(0)
  const [altaError, setAltaError] = useState<string | null>(null)
  const [excelError, setExcelError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const proveedorOptions = useMemo(
    () =>
      (proveedoresQuery.data ?? []).map((p) => ({ value: p.id, label: proveedorLabel(p) })),
    [proveedoresQuery.data],
  )

  const articuloOptions = useMemo(
    () => (articulosQuery.data ?? []).map((a) => ({ value: a.id, label: a.nombre })),
    [articulosQuery.data],
  )

  const medidaOptions = useMemo(
    () => (medidasQuery.data ?? []).map((m) => ({ value: m.id, label: medidaLabel(m) })),
    [medidasQuery.data],
  )

  const categoriaOptions = useMemo(
    () => (categoriasQuery.data ?? []).map((c) => ({ value: c.id, label: c.nombre })),
    [categoriasQuery.data],
  )

  const columnaOptions = useMemo(
    () =>
      (excelColumns ?? []).map((c) => ({
        value: c.header,
        label: `${c.letter} — ${c.header}`,
      })),
    [excelColumns],
  )

  const cantidades = cantidadQuery.data ?? []
  const totalItems = useMemo(() => cantidades.reduce((acc, c) => acc + c.cantidad, 0), [cantidades])

  const proveedorSeleccionado =
    cantidades.find((c) => c.proveedor.id === selectedProveedorId) ?? null

  const totalItemsProveedor = proveedorSeleccionado?.cantidad ?? 0
  const totalPaginas = Math.max(1, Math.ceil(totalItemsProveedor / ITEMS_POR_PAGINA))

  const detalleItems = detalleQuery.data ?? []

  const detailRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return detalleItems
    return detalleItems.filter((it) => it.articulo.nombre.toLowerCase().includes(term))
  }, [detalleItems, search])

  const toggleCategoria = (id: string) => {
    setCategoriasFiltro((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  const toggleMapeo = (key: string) => {
    setMapeo((prev) =>
      prev.some((m) => m.key === key)
        ? prev.filter((m) => m.key !== key)
        : [...prev, { key, value: '' }],
    )
  }

  const setMapeoValue = (key: string, value: string) => {
    setMapeo((prev) => prev.map((m) => (m.key === key ? { ...m, value } : m)))
  }

  const handleExcelFileChange = async (file: File | null) => {
    setExcelFile(file)
    setExcelColumns(null)
    setMapeo([])
    setExcelError(null)
    if (!file) return
    setExcelReading(true)
    try {
      const cols = await readExcelColumns(file)
      setExcelColumns(cols)
      setMapeo(autoMapear(cols))
    } catch {
      setExcelError('No se pudo leer el archivo. Verificá que sea un Excel válido (.xlsx o .xls).')
    } finally {
      setExcelReading(false)
    }
  }

  const openAlta = () => {
    setProveedorMode('existente')
    reset({
      proveedor_id: '',
      proveedor_nombre: '',
      proveedor_apellido: '',
      proveedor_telefono: '',
      proveedor_direccion: '',
      items: [itemVacio()],
    })
    setExpandedItemIndex(0)
    setAltaOpen(true)
  }

  const closeAlta = () => {
    setAltaOpen(false)
    reset()
  }

  const openExcel = () => {
    setExcelProveedorMode('existente')
    resetExcel()
    setExcelFile(null)
    setExcelColumns(null)
    setMapeo([])
    setExcelOpen(true)
  }

  const closeExcel = () => {
    setExcelOpen(false)
    resetExcel()
    setExcelFile(null)
    setExcelColumns(null)
    setMapeo([])
  }

  const openEdit = (item: ListaPrecioOut) => {
    setEditItem(item)
    resetEdit({ precio_lista: Number(item.precio_lista), id_articulo_proveedor: item.id_articulo_proveedor ?? '' })
  }

  const closeEdit = () => {
    setEditItem(null)
    resetEdit()
  }

  const itemIniciado = (it: ItemAltaForm) =>
    (it.articulo_modo === 'nuevo'
      ? Boolean(it.articulo_nombre.trim() || it.articulo_categoria_id)
      : Boolean(it.articulo_id)) ||
    (it.medida_modo === 'nuevo'
      ? Boolean(it.medida_unidad.trim() || it.medida_texto.trim())
      : Boolean(it.medida_id)) ||
    Boolean(it.id_articulo_proveedor?.trim()) ||
    (Number.isFinite(it.precio_lista) && it.precio_lista > 0)

  const filaVacia = (index: number) => {
    const it = getValues(`items.${index}` as const)
    return !it || !itemIniciado(it)
  }

  const onSubmitAlta = (values: AltaFormValues) => {
    const cleanItems = values.items.filter(itemIniciado)
    if (cleanItems.length === 0) {
      setAltaError('Agregá al menos un ítem con artículo, medida y precio')
      return
    }
    const payload: ListaPreciosAltaPayload = {
      proveedor_id: proveedorMode === 'existente' ? values.proveedor_id || null : null,
      proveedor:
        proveedorMode === 'nuevo'
          ? {
              nombre: values.proveedor_nombre,
              apellido: values.proveedor_apellido,
              telefono: values.proveedor_telefono,
              direccion: values.proveedor_direccion?.trim() || null,
            }
          : null,
      items: cleanItems.map((it) => ({
        articulo:
          it.articulo_modo === 'nuevo'
            ? {
                nombre: it.articulo_nombre.trim(),
                categoria_id: it.articulo_categoria_id,
                descripcion: it.articulo_descripcion?.trim() || null,
              }
            : { id: it.articulo_id },
        medida:
          it.medida_modo === 'nuevo'
            ? { unidad_medida: it.medida_unidad.trim(), medida: it.medida_texto.trim() }
            : { id: it.medida_id },
        precio_lista: Number(it.precio_lista),
        id_articulo_proveedor: it.id_articulo_proveedor?.trim() || null,
      })),
    }
    const creaEntidades = cleanItems.some(
      (it) => it.articulo_modo === 'nuevo' || it.medida_modo === 'nuevo',
    )
    crearMutation.mutate(payload, {
      onSuccess: () => {
        closeAlta()
        if (creaEntidades) {
          queryClient.invalidateQueries({ queryKey: ['articulos'] })
          queryClient.invalidateQueries({ queryKey: ['medidas'] })
        }
      },
    })
  }

  const onInvalidAlta = (errs: FieldErrors<AltaFormValues>) => {
    const idx = Array.isArray(errs.items)
      ? (errs.items as unknown[]).findIndex((e) => e != null)
      : -1
    if (idx >= 0) setExpandedItemIndex(idx)
    setAltaError(idx >= 0 ? 'Revisá los campos marcados en los ítems' : 'Revisá los campos marcados')
  }

  const onSubmitExcel = (values: ExcelFormValues) => {
    const activeMapeo = mapeo.filter((m) => m.value?.trim())
    const problemas: string[] = []
    if (!excelFile) problemas.push('seleccioná un archivo Excel')
    if (activeMapeo.length === 0) problemas.push('definí el mapeo de columnas')
    const keys = new Set(activeMapeo.map((m) => m.key))
    const combinado = keys.has('articulo_medida_combinado')
    if (!combinado && !keys.has('nombre') && !keys.has('articulo_id'))
      problemas.push('mapeá el artículo: "nombre" o "articulo_id"')
    if (
      !combinado &&
      !keys.has('medida_id') &&
      !(keys.has('unidad_medida') && keys.has('medida'))
    )
      problemas.push('mapeá la medida: "unidad_medida" y "medida" juntas, o "medida_id"')
    if (combinado) {
      const conflictivas = ['articulo_id', 'nombre', 'unidad_medida', 'medida', 'medida_id'].filter(
        (k) => keys.has(k),
      )
      if (conflictivas.length > 0)
        problemas.push(`"articulo_medida_combinado" no puede combinarse con: ${conflictivas.join(', ')}`)
    }
    if (!keys.has('precio_lista')) problemas.push('mapeá "precio_lista"')
    if (excelColumns) {
      const validos = new Set(excelColumns.map((c) => c.header))
      const asignadas = new Map<string, string>()
      for (const m of activeMapeo) {
        if (!validos.has(m.value)) {
          problemas.push(`la columna "${m.value}" no existe en el archivo`)
        } else if (asignadas.has(m.value)) {
          problemas.push(`"${asignadas.get(m.value)}" y "${m.key}" apuntan a la misma columna`)
        } else {
          asignadas.set(m.value, m.key)
        }
      }
    }
    if (problemas.length > 0) {
      setExcelError(`Para cargar la lista primero: ${problemas.join('; ')}.`)
      return
    }
    setExcelError(null)
    const formData = new FormData()
    formData.append('archivo', excelFile!)
    formData.append('mapeo', JSON.stringify(activeMapeo.map((m) => ({ key: m.key, value: m.value.trim() }))))
    if (excelProveedorMode === 'existente') {
      if (!values.proveedor_id) {
        setExcelError('Seleccioná un proveedor')
        return
      }
      formData.append('proveedor_id', values.proveedor_id)
    } else {
      formData.append(
        'proveedor',
        JSON.stringify({
          nombre: values.proveedor_nombre,
          apellido: values.proveedor_apellido,
          telefono: values.proveedor_telefono,
          direccion: values.proveedor_direccion?.trim() || null,
        }),
      )
    }
    excelMutation.mutate(formData, { onSuccess: closeExcel })
  }

  const onSubmitEdit = (values: EditFormValues) => {
    if (!editItem) return
    actualizarMutation.mutate(
      {
        id: editItem.id,
        data: {
          precio_lista: Number(values.precio_lista),
          id_articulo_proveedor: values.id_articulo_proveedor?.trim() || null,
        },
      },
      { onSuccess: closeEdit },
    )
  }

  const handleEliminar = (item: ListaPrecioOut) => {
    if (!window.confirm(`¿Eliminar "${item.articulo.nombre}" de la lista de ${proveedorLabel(item.proveedor)}?`)) return
    eliminarMutation.mutate(item.id)
  }

  const listadoError = (() => {
    if (!cantidadQuery.error) return null
    const err = cantidadQuery.error
    return err instanceof ApiError ? err.message : err.message
  })()

  const detalleError = (() => {
    if (!detalleQuery.error) return null
    const err = detalleQuery.error
    return err instanceof ApiError ? err.message : err.message
  })()

  const altaMutationError = (() => {
    if (!crearMutation.error) return null
    const err = crearMutation.error
    return err instanceof ApiError ? err.message : err.message
  })()

  const excelMutationError = (() => {
    if (!excelMutation.error) return null
    const err = excelMutation.error
    return err instanceof ApiError ? err.message : err.message
  })()

  const editMutationError = (() => {
    if (!actualizarMutation.error) return null
    const err = actualizarMutation.error
    return err instanceof ApiError ? err.message : err.message
  })()

  const eliminarError = (() => {
    if (!eliminarMutation.error) return null
    const err = eliminarMutation.error
    return err instanceof ApiError ? err.message : err.message
  })()

  if (cantidadQuery.isPending) {
    return (
      <PageContainer>
        <EmptyState message="Cargando listas de precios…" />
      </PageContainer>
    )
  }

  if (cantidadQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="Listas de precios" subtitle="No se pudieron cargar las listas de precios desde el servidor" />
        <Alert size="md">{listadoError}</Alert>
      </PageContainer>
    )
  }

  const detailColumns: Column<ListaPrecioOut>[] = [
    {
      key: 'articulo',
      header: 'Artículo',
      render: (r) => <span className="font-medium">{r.articulo.nombre}</span>,
    },
    {
      key: 'medida',
      header: 'Medida',
      render: (r) => <span className="text-muted-foreground">{medidaLabel(r.medida)}</span>,
    },
    {
      key: 'precio',
      header: 'Precio de lista',
      mono: true,
      render: (r) => <span className="font-bold text-primary">{formatCurrency(Number(r.precio_lista))}</span>,
    },
  ]

  const tableColumns: Column<ListaPrecioOut>[] = [
    ...detailColumns,
    ...(isAdmin
      ? [
          {
            key: 'acciones',
            header: '',
            align: 'right' as const,
            nowrap: true,
            render: (r: ListaPrecioOut) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" aria-label={`Editar ${r.articulo.nombre}`} onClick={() => openEdit(r)}>
                  ✎
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Eliminar ${r.articulo.nombre}`}
                  onClick={() => handleEliminar(r)}
                >
                  🗑
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Listas de precios"
        subtitle={`${totalItems} ítems de listas de precios`}
        action={
          isAdmin ? (
            <div className="flex gap-2.5">
              <Button onClick={openAlta}>+ Nueva lista</Button>
              <Button variant="accent" onClick={openExcel}>
                Cargar Excel
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="flex gap-3 mb-4 items-start flex-wrap">
        <div className="w-64">
          <SearchableSelect
            value={selectedProveedorId ?? ''}
            onChange={(v) => setSelectedProveedorId(v || null)}
            options={proveedorOptions}
            placeholder="Filtrar por proveedor…"
            optional
            noneLabel="Todos los proveedores"
          />
        </div>

        <div className="bg-card border border-border rounded-lg px-3 py-2.5">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground mb-1.5">
            Categorías
          </div>
          <div className="flex gap-3 flex-wrap">
            {(categoriasQuery.data ?? []).map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoriasFiltro.includes(c.id)}
                  onChange={() => toggleCategoria(c.id)}
                />
                {c.nombre}
              </label>
            ))}
          </div>
        </div>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por artículo…"
        />
      </div>

      {eliminarError && <Alert style={{ marginBottom: 16 }}>{eliminarError}</Alert>}

      <div className="grid grid-cols-[360px_1fr] gap-5 items-start">
        {/* Proveedor cards */}
        <div className="flex flex-col gap-2.5">
          {cantidades.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sin listas de precios cargadas.</div>
          ) : (
            cantidades.map((c) => {
              const isSelected = selectedProveedorId === c.proveedor.id
              return (
                <div
                  key={c.proveedor.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProveedorId(isSelected ? null : c.proveedor.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedProveedorId(isSelected ? null : c.proveedor.id)
                  }}
                  className={`px-[18px] py-4 cursor-pointer transition-all duration-150 rounded-xl border-[1.5px] ${
                    isSelected ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}
                >
                  <div className="font-bold text-sm mb-2.5">
                    <span className={isSelected ? 'text-white' : 'text-foreground'}>
                      {proveedorLabel(c.proveedor)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div>
                      <div className={`text-lg font-extrabold font-mono ${isSelected ? 'text-white' : 'text-foreground'}`}>
                        {c.cantidad}
                      </div>
                      <div className={`text-[10px] font-semibold ${isSelected ? 'text-white/60' : 'text-muted-foreground'}`}>
                        artículos
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detalle */}
        {proveedorSeleccionado ? (
          <div className="rounded-xl overflow-hidden">
            <div className="bg-card border border-border rounded-t-xl px-5 py-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-[15px]">{proveedorLabel(proveedorSeleccionado.proveedor)}</div>
                <div className="text-xs text-muted-foreground">
                  {proveedorSeleccionado.cantidad} artículos en su lista de precios
                </div>
              </div>
            </div>
            {detalleQuery.isPending ? (
              <EmptyState message="Cargando artículos…" />
            ) : detalleQuery.isError ? (
              <Alert style={{ margin: 16 }}>{detalleError}</Alert>
            ) : detailRows.length > 0 ? (
              <>
                <DataTable columns={tableColumns} rows={detailRows} rowKey={(r) => r.id} />
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card rounded-b-xl">
                    <span className="text-xs text-muted-foreground">
                      Página {paginaActual} de {totalPaginas} ({totalItemsProveedor} artículos)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginaActual <= 1}
                        onClick={() => setPaginaActual((p) => p - 1)}
                      >
                        ← Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginaActual >= totalPaginas}
                        onClick={() => setPaginaActual((p) => p + 1)}
                      >
                        Siguiente →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState icon="◷" message="Sin resultados para la búsqueda actual" />
            )}
          </div>
        ) : (
          <EmptyState icon="◷" message="Seleccioná un proveedor para ver el detalle" />
        )}
      </div>

      {/* Alta manual */}
      <Modal open={altaOpen} onClose={closeAlta} title="Nueva lista de precios" width={640}>
        <form onSubmit={handleSubmit(onSubmitAlta, onInvalidAlta)} noValidate>
          <div className="rounded-lg border border-border p-3.5 mb-4">
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <span className="text-[13px] font-bold">Proveedor</span>
              <FilterPills
                options={[
                  { value: 'existente', label: 'Existente' },
                  { value: 'nuevo', label: 'Nuevo' },
                ]}
                active={proveedorMode}
                onChange={(v) => setProveedorMode(v as 'existente' | 'nuevo')}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {proveedorMode === 'existente' ? (
                <div className="col-span-full">
                  <Field label="Proveedor" error={errors.proveedor_id?.message}>
                    <Controller
                      control={control}
                      name="proveedor_id"
                      rules={{
                        validate: (v) =>
                          proveedorMode === 'existente' && !v ? 'Seleccioná un proveedor' : true,
                      }}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          options={proveedorOptions}
                          placeholder="Buscar proveedor…"
                        />
                      )}
                    />
                  </Field>
                </div>
              ) : (
                <>
                  <Field label="Nombre" error={errors.proveedor_nombre?.message}>
                    <Input
                      placeholder="Nombre"
                      {...register('proveedor_nombre', {
                        validate: (v) =>
                          proveedorMode === 'nuevo' && !v ? 'Nombre requerido' : true,
                      })}
                    />
                  </Field>
                  <Field label="Apellido" error={errors.proveedor_apellido?.message}>
                    <Input
                      placeholder="Apellido"
                      {...register('proveedor_apellido', {
                        validate: (v) =>
                          proveedorMode === 'nuevo' && !v ? 'Apellido requerido' : true,
                      })}
                    />
                  </Field>
                  <Field label="Teléfono" error={errors.proveedor_telefono?.message}>
                    <Input
                      placeholder="Teléfono"
                      {...register('proveedor_telefono', {
                        validate: (v) =>
                          proveedorMode === 'nuevo' && !v ? 'Teléfono requerido' : true,
                      })}
                    />
                  </Field>
                  <Field label="Dirección">
                    <Input placeholder="Dirección opcional" {...register('proveedor_direccion')} />
                  </Field>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border p-3.5 mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[13px] font-bold">Ítems de la lista</div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  append(itemVacio())
                  setExpandedItemIndex(fields.length)
                }}
              >
                + Agregar ítem
              </Button>
            </div>
            {fields.length === 0 && (
              <div className="text-xs text-muted-foreground mb-2">Sin ítems cargados.</div>
            )}
            <div className="grid gap-2.5">
              {fields.map((field, index) => {
                const isExpanded = expandedItemIndex === index
                const item = itemsWatch?.[index]
                const itemErrors = errors.items?.[index]
                const articuloError =
                  itemErrors?.articulo_id?.message ??
                  itemErrors?.articulo_nombre?.message ??
                  itemErrors?.articulo_categoria_id?.message
                const medidaError =
                  itemErrors?.medida_id?.message ??
                  itemErrors?.medida_unidad?.message ??
                  itemErrors?.medida_texto?.message
                const articuloResumen =
                  item?.articulo_modo === 'nuevo'
                    ? item.articulo_nombre?.trim() || 'Nuevo artículo'
                    : articuloOptions.find((o) => o.value === item?.articulo_id)?.label ?? 'Sin artículo'
                const medidaResumen =
                  item?.medida_modo === 'nuevo'
                    ? [item.medida_texto?.trim(), item.medida_unidad?.trim()].filter(Boolean).join(' ') || 'Nueva medida'
                    : medidaOptions.find((o) => o.value === item?.medida_id)?.label ?? 'Sin medida'
                return (
                  <div key={field.id} className="rounded-md bg-muted border border-border">
                    {!isExpanded ? (
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                        <button
                          type="button"
                          className="flex-1 min-w-0 text-left cursor-pointer"
                          onClick={() => setExpandedItemIndex(index)}
                        >
                          <div className="text-[13px] font-semibold truncate">{articuloResumen}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {medidaResumen}
                            {item && Number.isFinite(item.precio_lista) && item.precio_lista > 0
                              ? ` · ${formatCurrency(Number(item.precio_lista))}`
                              : ''}
                          </div>
                        </button>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Editar ítem ${index + 1}`}
                            onClick={() => setExpandedItemIndex(index)}
                          >
                            ✎
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Eliminar ítem ${index + 1}`}
                            onClick={() => {
                              remove(index)
                              setExpandedItemIndex((prev) =>
                                prev == null ? prev : prev === index ? null : prev > index ? prev - 1 : prev,
                              )
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            Ítem {index + 1}
                          </span>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Colapsar ítem ${index + 1}`}
                              onClick={() => setExpandedItemIndex(null)}
                            >
                              ▲ Colapsar
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Artículo" error={articuloError}>
                            <div className="grid gap-1.5">
                              <FilterPills
                                options={[
                                  { value: 'existente', label: 'Existente' },
                                  { value: 'nuevo', label: 'Nuevo' },
                                ]}
                                active={itemsWatch?.[index]?.articulo_modo ?? 'existente'}
                                onChange={(v) =>
                                  setValue(`items.${index}.articulo_modo`, v as ModoEntidad)
                                }
                              />
                              {itemsWatch?.[index]?.articulo_modo === 'nuevo' ? (
                                <>
                                  <Input
                                    placeholder="Nombre del artículo"
                                    {...register(`items.${index}.articulo_nombre` as const, {
                                      validate: (v) => {
                                        if (filaVacia(index)) return true
                                        if (getValues(`items.${index}.articulo_modo`) !== 'nuevo') return true
                                        return v.trim() ? true : 'Ingresá el nombre del artículo'
                                      },
                                    })}
                                  />
                                  <Controller
                                    control={control}
                                    name={`items.${index}.articulo_categoria_id` as const}
                                    rules={{
                                      validate: (v) => {
                                        if (filaVacia(index)) return true
                                        if (getValues(`items.${index}.articulo_modo`) !== 'nuevo') return true
                                        return v ? true : 'Seleccioná una categoría'
                                      },
                                    }}
                                    render={({ field: f }) => (
                                      <SearchableSelect
                                        value={f.value ?? ''}
                                        onChange={f.onChange}
                                        onBlur={f.onBlur}
                                        options={categoriaOptions}
                                        placeholder="Categoría…"
                                      />
                                    )}
                                  />
                                  <Input
                                    placeholder="Descripción (opcional)"
                                    {...register(`items.${index}.articulo_descripcion` as const)}
                                  />
                                </>
                              ) : (
                                <Controller
                                  control={control}
                                  name={`items.${index}.articulo_id` as const}
                                  rules={{
                                    validate: (v) => {
                                      if (filaVacia(index)) return true
                                      if (getValues(`items.${index}.articulo_modo`) !== 'existente') return true
                                      return v ? true : 'Seleccioná un artículo'
                                    },
                                  }}
                                  render={({ field: f }) => (
                                    <SearchableSelect
                                      value={f.value ?? ''}
                                      onChange={f.onChange}
                                      onBlur={f.onBlur}
                                      options={articuloOptions}
                                      placeholder="Buscar artículo…"
                                    />
                                  )}
                                />
                              )}
                            </div>
                          </Field>
                          <Field label="Medida" error={medidaError}>
                            <div className="grid gap-1.5">
                              <FilterPills
                                options={[
                                  { value: 'existente', label: 'Existente' },
                                  { value: 'nuevo', label: 'Nueva' },
                                ]}
                                active={itemsWatch?.[index]?.medida_modo ?? 'existente'}
                                onChange={(v) =>
                                  setValue(`items.${index}.medida_modo`, v as ModoEntidad)
                                }
                              />
                              {itemsWatch?.[index]?.medida_modo === 'nuevo' ? (
                                <>
                                  <Input
                                    placeholder="Unidad de medida"
                                    {...register(`items.${index}.medida_unidad` as const, {
                                      validate: (v) => {
                                        if (filaVacia(index)) return true
                                        if (getValues(`items.${index}.medida_modo`) !== 'nuevo') return true
                                        return v.trim() ? true : 'Ingresá la unidad de medida'
                                      },
                                    })}
                                  />
                                  <Input
                                    placeholder="Medida"
                                    {...register(`items.${index}.medida_texto` as const, {
                                      validate: (v) => {
                                        if (filaVacia(index)) return true
                                        if (getValues(`items.${index}.medida_modo`) !== 'nuevo') return true
                                        return v.trim() ? true : 'Ingresá la medida'
                                      },
                                    })}
                                  />
                                </>
                              ) : (
                                <Controller
                                  control={control}
                                  name={`items.${index}.medida_id` as const}
                                  rules={{
                                    validate: (v) => {
                                      if (filaVacia(index)) return true
                                      if (getValues(`items.${index}.medida_modo`) !== 'existente') return true
                                      return v ? true : 'Seleccioná una medida'
                                    },
                                  }}
                                  render={({ field: f }) => (
                                    <SearchableSelect
                                      value={f.value ?? ''}
                                      onChange={f.onChange}
                                      onBlur={f.onBlur}
                                      options={medidaOptions}
                                      placeholder="Buscar medida…"
                                    />
                                  )}
                                />
                              )}
                            </div>
                          </Field>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-2 items-end">
                          <Field label="Precio de lista ($)" error={errors.items?.[index]?.precio_lista?.message}>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              {...register(`items.${index}.precio_lista` as const, {
                                valueAsNumber: true,
                                validate: (v) => (Number.isFinite(v) && v >= 0 ? true : 'Ingresá un precio válido'),
                              })}
                            />
                          </Field>
                          <Field label="Código proveedor">
                            <Input
                              placeholder="Opcional"
                              {...register(`items.${index}.id_articulo_proveedor` as const)}
                            />
                          </Field>
                          <Button
                            type="button"
                            variant="muted"
                            size="sm"
                            aria-label={`Eliminar ítem ${index + 1}`}
                            onClick={() => {
                              remove(index)
                              setExpandedItemIndex((prev) =>
                                prev == null ? prev : prev === index ? null : prev > index ? prev - 1 : prev,
                              )
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {(altaError ?? altaMutationError) && (
            <Alert style={{ marginTop: 14 }}>{altaError ?? altaMutationError}</Alert>
          )}

          <div className="flex gap-2.5 mt-5 justify-end">
            <Button type="button" variant="muted" size="sm" onClick={closeAlta}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={crearMutation.isPending}>
              {crearMutation.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alta por Excel */}
      <Modal open={excelOpen} onClose={closeExcel} title="Cargar lista de precios por Excel" width={640}>
        <form onSubmit={handleExcelSubmit(onSubmitExcel)} noValidate>
          <div className="rounded-lg border border-border p-3.5 mb-4">
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <span className="text-[13px] font-bold">Proveedor</span>
              <FilterPills
                options={[
                  { value: 'existente', label: 'Existente' },
                  { value: 'nuevo', label: 'Nuevo' },
                ]}
                active={excelProveedorMode}
                onChange={(v) => setExcelProveedorMode(v as 'existente' | 'nuevo')}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {excelProveedorMode === 'existente' ? (
                <div className="col-span-full">
                  <Field label="Proveedor" error={excelErrors.proveedor_id?.message}>
                    <Controller
                      control={excelForm.control}
                      name="proveedor_id"
                      rules={{
                        validate: (v) =>
                          excelProveedorMode === 'existente' && !v ? 'Seleccioná un proveedor' : true,
                      }}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          options={proveedorOptions}
                          placeholder="Buscar proveedor…"
                        />
                      )}
                    />
                  </Field>
                </div>
              ) : (
                <>
                  <Field label="Nombre" error={excelErrors.proveedor_nombre?.message}>
                    <Input
                      placeholder="Nombre"
                      {...registerExcel('proveedor_nombre', {
                        validate: (v) => (excelProveedorMode === 'nuevo' && !v ? 'Nombre requerido' : true),
                      })}
                    />
                  </Field>
                  <Field label="Apellido" error={excelErrors.proveedor_apellido?.message}>
                    <Input
                      placeholder="Apellido"
                      {...registerExcel('proveedor_apellido', {
                        validate: (v) => (excelProveedorMode === 'nuevo' && !v ? 'Apellido requerido' : true),
                      })}
                    />
                  </Field>
                  <Field label="Teléfono" error={excelErrors.proveedor_telefono?.message}>
                    <Input
                      placeholder="Teléfono"
                      {...registerExcel('proveedor_telefono', {
                        validate: (v) => (excelProveedorMode === 'nuevo' && !v ? 'Teléfono requerido' : true),
                      })}
                    />
                  </Field>
                  <Field label="Dirección">
                    <Input placeholder="Dirección opcional" {...registerExcel('proveedor_direccion')} />
                  </Field>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            {excelFile ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border-[1.5px] border-primary bg-muted px-4 py-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate">{excelFile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(excelFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <Button
                  type="button"
                  variant="muted"
                  size="sm"
                  onClick={() => handleExcelFileChange(null)}
                >
                  Quitar
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed border-border bg-background py-7 cursor-pointer hover:border-primary hover:bg-muted transition-colors">
                <span className="text-2xl font-bold text-primary leading-none">+</span>
                <span className="text-[13px] font-semibold">Seleccionar archivo Excel</span>
                <span className="text-xs text-muted-foreground">
                  Formatos .xlsx o .xls · la primera fila debe tener los encabezados
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    handleExcelFileChange(e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>

          <div className={`rounded-lg border border-border p-3.5 mt-4 ${excelFile ? '' : 'opacity-60'}`}>
            <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
              <div className="text-[13px] font-bold">Mapeo de columnas</div>
              {excelColumns && excelColumns.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMapeo(autoMapear(excelColumns))}
                >
                  Auto-mapear
                </Button>
              )}
            </div>
            {!excelFile ? (
              <div className="text-xs text-muted-foreground">
                Seleccioná un archivo para detectar sus columnas y mapearlas.
              </div>
            ) : excelReading ? (
              <div className="text-xs text-muted-foreground">Leyendo columnas del archivo…</div>
            ) : (
              <>
                {excelColumns && excelColumns.length > 0 && (
                  <div className="text-[11px] text-muted-foreground mb-2.5 break-words">
                    Columnas detectadas:{' '}
                    {excelColumns.map((c) => `${c.letter}=${c.header}`).join(' · ')}
                  </div>
                )}
                {excelColumns && excelColumns.length === 0 && (
                  <div className="text-xs text-muted-foreground mb-2.5">
                    No se detectaron encabezados en la primera fila del archivo.
                  </div>
                )}
                <div className="grid gap-2">
                  {MAPEO_KEYS.map((key) => {
                    const row = mapeo.find((m) => m.key === key)
                    const enabled = Boolean(row)
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleMapeo(key)}
                          className="shrink-0"
                        />
                        <span className="w-40 text-[13px] font-mono text-muted-foreground shrink-0">
                          {key}
                        </span>
                        {enabled && (
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={row!.value}
                              onChange={(v) => setMapeoValue(key, v)}
                              options={columnaOptions}
                              placeholder="Elegí una columna…"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="text-[11px] text-muted-foreground mt-2.5">
                  Requerido: {MAPEO_REQUERIDOS.join(' · ')}
                </div>
              </>
            )}
          </div>

          {(excelError ?? excelMutationError) && (
            <Alert style={{ marginTop: 14 }}>{excelError ?? excelMutationError}</Alert>
          )}

          <div className="flex gap-2.5 mt-5 justify-end">
            <Button type="button" variant="muted" size="sm" onClick={closeExcel}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={excelMutation.isPending}>
              {excelMutation.isPending ? 'Subiendo…' : 'Cargar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edición de ítem */}
      <Modal open={Boolean(editItem)} onClose={closeEdit} title="Editar precio de lista" width={480}>
        {editItem && (
          <form onSubmit={handleEditSubmit(onSubmitEdit)} noValidate>
            <div className="grid gap-3.5">
              <div className="text-sm">
                <span className="font-bold">{editItem.articulo.nombre}</span>
                <span className="text-muted-foreground"> — {medidaLabel(editItem.medida)}</span>
              </div>
              <Field label="Precio de lista ($)" error={editErrors.precio_lista?.message}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  {...registerEdit('precio_lista', {
                    valueAsNumber: true,
                    validate: (v) => (Number.isFinite(v) && v >= 0 ? true : 'Ingresá un precio válido'),
                  })}
                />
              </Field>
              <Field label="Código proveedor">
                <Input placeholder="Opcional" {...registerEdit('id_articulo_proveedor')} />
              </Field>
            </div>

            {editMutationError && <Alert style={{ marginTop: 14 }}>{editMutationError}</Alert>}

            <div className="flex gap-2.5 mt-5 justify-end">
              <Button type="button" variant="muted" size="sm" onClick={closeEdit}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={actualizarMutation.isPending}>
                {actualizarMutation.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  )
}
