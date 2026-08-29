import { useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useInventarios } from '../hooks/useInventarios'
import { useMetodosPago } from '../hooks/useMetodosPago'
import {
  useActualizarVenta,
  useCrearVenta,
  useEliminarVenta,
  useVentas,
} from '../hooks/useVentas'
import { formatCurrency } from '../lib/format'
import type { ItemVentaPayload, VentaOut } from '../types/domain'
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

const ESTADO_APROBADA = 'Aprobada'
const ESTADO_PENDIENTE = 'Pendiente'

const estadoColor: Record<string, string> = {
  [ESTADO_APROBADA]: '#7B9A4A',
  [ESTADO_PENDIENTE]: '#C8763A',
}

const filtros = ['Todas', ESTADO_APROBADA, ESTADO_PENDIENTE]

function estadoDe(venta: VentaOut): string {
  return venta.aprobado ? ESTADO_APROBADA : ESTADO_PENDIENTE
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function money(value: string): string {
  return formatCurrency(Number(value))
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

type ItemRow = { key: number; inventario_id: string; cantidad: string }

type VentaFormValues = {
  cliente: string
  metodo_pago_id: string
  aprobado: boolean
}

function FilasItems({
  rows,
  rowErrors,
  options,
  onChange,
  onRemove,
}: {
  rows: ItemRow[]
  rowErrors: Record<number, string>
  options: { value: string; label: string }[]
  onChange: (key: number, patch: Partial<ItemRow>) => void
  onRemove: (key: number) => void
}) {
  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <SearchableSelect
                value={row.inventario_id}
                onChange={(v) => onChange(row.key, { inventario_id: v })}
                onBlur={() => {}}
                options={options}
                placeholder="Buscar artículo…"
              />
            </div>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder="Cant."
              className="w-[90px]"
              value={row.cantidad}
              onChange={(e) => onChange(row.key, { cantidad: e.target.value })}
            />
            <Button
              type="button"
              variant="muted"
              size="xs"
              onClick={() => onRemove(row.key)}
              aria-label="Quitar ítem"
            >
              ✕
            </Button>
          </div>
          {rowErrors[row.key] && <p className="mt-1 text-xs text-danger">{rowErrors[row.key]}</p>}
        </div>
      ))}
    </div>
  )
}

export default function SalesPage() {
  const [filtro, setFiltro] = useState('Todas')
  const [detalle, setDetalle] = useState<VentaOut | null>(null)
  const [nuevaOpen, setNuevaOpen] = useState(false)
  const [editando, setEditando] = useState<VentaOut | null>(null)
  const [accionErrorId, setAccionErrorId] = useState<string | null>(null)

  const [rows, setRows] = useState<ItemRow[]>([])
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({})
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [stockExtra, setStockExtra] = useState<Record<string, number>>({})
  const [metodoEdit, setMetodoEdit] = useState('')
  const [clienteEdit, setClienteEdit] = useState('')
  const nextKey = useRef(1)

  const ventasQuery = useVentas()
  const inventariosQuery = useInventarios()
  const metodosDetalleQuery = useMetodosPago({ enabled: detalle !== null })
  const metodosQuery = useMetodosPago({ enabled: nuevaOpen || editando !== null })
  const crearMutation = useCrearVenta()
  const estadoMutation = useActualizarVenta()
  const editarMutation = useActualizarVenta()
  const eliminarMutation = useEliminarVenta()

  const {
    register,
    handleSubmit,
    control,
    reset,
  } = useForm<VentaFormValues>({
    defaultValues: { cliente: '', metodo_pago_id: '', aprobado: true },
  })

  const ventas = ventasQuery.data ?? []

  const filtradas = useMemo(
    () => (filtro === 'Todas' ? ventas : ventas.filter((v) => estadoDe(v) === filtro)),
    [ventas, filtro],
  )

  const total = filtradas.reduce((acc, v) => acc + Number(v.total), 0)

  const conStock = useMemo(
    () => (inventariosQuery.data ?? []).filter((i) => i.stock > 0),
    [inventariosQuery.data],
  )

  const articuloOptions = useMemo(() => {
    const enFilas = new Set(rows.map((r) => r.inventario_id))
    return (inventariosQuery.data ?? [])
      .filter((i) => i.stock > 0 || enFilas.has(i.id))
      .map((i) => ({
        value: i.id,
        label: `${i.articulo.nombre} — ${`${i.medida.medida} ${i.medida.unidad_medida}`.trim()} · stock: ${i.stock}`,
      }))
  }, [inventariosQuery.data, rows])

  const metodoPagoOptions = useMemo(
    () => (metodosQuery.data ?? []).map((m) => ({ value: m.id, label: m.nombre })),
    [metodosQuery.data],
  )

  const metodoNombre = (id: string | null): string => {
    if (!id) return '-'
    return (metodosDetalleQuery.data ?? []).find((m) => m.id === id)?.nombre ?? '-'
  }

  const addRow = () => {
    setRows((rs) => [...rs, { key: nextKey.current++, inventario_id: '', cantidad: '' }])
  }

  const updateRow = (key: number, patch: Partial<ItemRow>) => {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  const removeRow = (key: number) => {
    setRows((rs) => rs.filter((r) => r.key !== key))
  }

  const resetFilas = () => {
    setRows([])
    setRowErrors({})
    setItemsError(null)
  }

  const validarFilas = (extras: Record<string, number> = {}): ItemVentaPayload[] | null => {
    if (rows.length === 0) {
      setRowErrors({})
      setItemsError('Agregá al menos un artículo')
      return null
    }
    setItemsError(null)
    const errs: Record<number, string> = {}
    const items: ItemVentaPayload[] = []
    for (const row of rows) {
      if (!row.inventario_id) {
        errs[row.key] = 'Seleccioná un artículo'
        continue
      }
      const cant = Number(row.cantidad)
      if (!Number.isFinite(cant) || cant <= 0) {
        errs[row.key] = 'Ingresá una cantidad mayor a 0'
        continue
      }
      const stock = conStock.find((i) => i.id === row.inventario_id)?.stock ?? 0
      const disponible = stock + (extras[row.inventario_id] ?? 0)
      if (cant > disponible) {
        errs[row.key] = `El stock disponible es ${disponible}`
        continue
      }
      items.push({ inventario_id: row.inventario_id, cantidad: cant })
    }
    setRowErrors(errs)
    return Object.keys(errs).length === 0 ? items : null
  }

  const openNueva = () => {
    reset({ cliente: '', metodo_pago_id: '', aprobado: true })
    resetFilas()
    setNuevaOpen(true)
  }

  const closeNueva = () => {
    setNuevaOpen(false)
    reset()
    resetFilas()
  }

  const openEditar = (venta: VentaOut) => {
    const inventarios = inventariosQuery.data ?? []
    const extras: Record<string, number> = {}
    const filas: ItemRow[] = []
    let noResuelto = false
    for (const d of venta.detalles) {
      const inv = inventarios.find(
        (i) => i.articulo.id === d.articulo.id && i.medida.id === d.medida.id,
      )
      if (!inv) {
        noResuelto = true
        continue
      }
      extras[inv.id] = (extras[inv.id] ?? 0) + d.cantidad
      filas.push({ key: nextKey.current++, inventario_id: inv.id, cantidad: String(d.cantidad) })
    }
    setEditando(venta)
    setStockExtra(extras)
    setRows(filas)
    setRowErrors({})
    setItemsError(
      noResuelto
        ? 'No se encontró la fila de inventario de algún ítem existente. Recreá esa combinación artículo/medida en inventario antes de editar esta venta.'
        : null,
    )
    setMetodoEdit(venta.detalles[0]?.metodo_pago_id ?? '')
    setClienteEdit(venta.cliente ?? '')
  }

  const closeEditar = () => {
    setEditando(null)
    setStockExtra({})
    setMetodoEdit('')
    setClienteEdit('')
    resetFilas()
  }

  const onNuevaSubmit = (values: VentaFormValues) => {
    const items = validarFilas()
    if (!items) return
    crearMutation.mutate(
      {
        items: items.map((i) => ({ ...i, metodo_pago_id: values.metodo_pago_id || null })),
        aprobado: values.aprobado,
        cliente: values.cliente.trim() || null,
        presupuesto_id: null,
      },
      { onSuccess: closeNueva },
    )
  }

  const onEditarSubmit = () => {
    if (!editando) return
    const items = validarFilas(stockExtra)
    if (!items) return
    editarMutation.mutate(
      {
        id: editando.id,
        data: {
          items: items.map((i) => ({ ...i, metodo_pago_id: metodoEdit || null })),
          cliente: clienteEdit.trim() || null,
        },
      },
      { onSuccess: closeEditar },
    )
  }

  const cambiarEstado = (venta: VentaOut, aprobado: boolean) => {
    if (aprobado === venta.aprobado) return
    setAccionErrorId(null)
    estadoMutation.mutate(
      { id: venta.id, data: { aprobado } },
      { onError: () => setAccionErrorId(venta.id) },
    )
  }

  const cancelar = (venta: VentaOut) => {
    if (!window.confirm(`¿Cancelar la venta #${venta.numero}? La venta se dará de baja.`)) return
    setAccionErrorId(null)
    eliminarMutation.mutate(venta.id, { onError: () => setAccionErrorId(venta.id) })
  }

  const accionError = estadoMutation.isError
    ? estadoMutation.error
    : eliminarMutation.isError
      ? eliminarMutation.error
      : null

  const ventaConAccionError = accionError
    ? ventas.find((v) => v.id === accionErrorId) ?? null
    : null

  const columns: Column<VentaOut>[] = [
    {
      key: 'numero',
      header: 'N° Venta',
      mono: true,
      render: (v) => <span className="text-primary font-semibold">#{v.numero}</span>,
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (v) => <span className="text-muted-foreground">{formatDate(v.fecha)}</span>,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (v) => <span className="font-semibold">{v.cliente ?? '-'}</span>,
    },
    {
      key: 'cantidad',
      header: 'Artículos',
      render: (v) => <span className="text-muted-foreground">{v.cantidad} art.</span>,
    },
    {
      key: 'total',
      header: 'Total',
      mono: true,
      render: (v) => <span className="text-[14px] font-extrabold">{money(v.total)}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (v) => (
        <select
          value={estadoDe(v)}
          disabled={estadoMutation.isPending}
          onChange={(e) => cambiarEstado(v, e.target.value === ESTADO_APROBADA)}
          className="cursor-pointer rounded-md border border-border bg-card px-2 py-1 text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value={ESTADO_PENDIENTE}>{ESTADO_PENDIENTE}</option>
          <option value={ESTADO_APROBADA}>{ESTADO_APROBADA}</option>
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (v) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-label={`Editar venta #${v.numero}`}
            onClick={() => openEditar(v)}
          >
            ✎
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-label={`Cancelar venta #${v.numero}`}
            disabled={estadoDe(v) !== ESTADO_PENDIENTE || eliminarMutation.isPending}
            onClick={() => cancelar(v)}
          >
            🗑
          </Button>
          <Button variant="outline" size="xs" type="button" onClick={() => setDetalle(v)}>
            Ver
          </Button>
          <Button variant="outline" size="xs" type="button" className="text-primary">
            PDF
          </Button>
        </div>
      ),
    },
  ]

  if (ventasQuery.isPending) {
    return (
      <PageContainer>
        <EmptyState message="Cargando ventas…" />
      </PageContainer>
    )
  }

  if (ventasQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="Ventas" subtitle="No se pudieron cargar las ventas desde el servidor" />
        <Alert size="md">{errorMessage(ventasQuery.error, 'Error al cargar las ventas')}</Alert>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Ventas"
        subtitle={
          <>
            Total filtrado: <strong>{formatCurrency(total)}</strong>
          </>
        }
        action={<Button variant="accent" onClick={openNueva}>+ Nueva venta</Button>}
      />

      <div className="mb-4">
        <FilterPills options={filtros} active={filtro} onChange={setFiltro} />
      </div>

      {accionError && (
        <Alert style={{ marginBottom: 16 }}>
          {ventaConAccionError
            ? `No se pudo realizar la acción sobre la venta #${ventaConAccionError.numero}. ${errorMessage(accionError, 'Error en la acción sobre la venta')}`
            : errorMessage(accionError, 'Error en la acción sobre la venta')}
        </Alert>
      )}

      {filtradas.length === 0 ? (
        <EmptyState icon="◷" message="No hay ventas para el filtro seleccionado" />
      ) : (
        <DataTable
          columns={columns}
          rows={filtradas}
          rowKey={(v) => v.id}
          cellPadding="13px 16px"
          rowClassName={(v) => (accionErrorId === v.id ? 'bg-danger/10' : undefined)}
        />
      )}

      <Modal open={Boolean(detalle)} onClose={() => setDetalle(null)} title={`Venta #${detalle?.numero ?? ''}`} width={680}>
        {detalle && (
          <div>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3.5 mb-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Fecha</div>
                <div className="font-semibold">{formatDate(detalle.fecha)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div className="font-semibold">{detalle.cliente ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Estado</div>
                <Badge color={estadoColor[estadoDe(detalle)]}>{estadoDe(detalle)}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-extrabold">{money(detalle.total)}</div>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-secondary text-muted-foreground text-xs text-left">
                    <th className="py-2 px-3 font-semibold">Artículo</th>
                    <th className="py-2 px-3 font-semibold">Medida</th>
                    <th className="py-2 px-3 font-semibold text-right">Cantidad</th>
                    <th className="py-2 px-3 font-semibold text-right">P. Unitario</th>
                    <th className="py-2 px-3 font-semibold text-right">Subtotal</th>
                    <th className="py-2 px-3 font-semibold">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.detalles.map((d) => (
                    <tr key={d.id} className="border-t border-border">
                      <td className="py-2 px-3 font-semibold">{d.articulo.nombre}</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {`${d.medida.medida} ${d.medida.unidad_medida}`.trim()}
                      </td>
                      <td className="py-2 px-3 text-right">{d.cantidad}</td>
                      <td className="py-2 px-3 text-right">{money(d.precio_venta)}</td>
                      <td className="py-2 px-3 text-right font-bold">{money(d.sub_total)}</td>
                      <td className="py-2 px-3 text-muted-foreground">{metodoNombre(d.metodo_pago_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <Button type="button" variant="muted" size="sm" onClick={() => setDetalle(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={nuevaOpen} onClose={closeNueva} title="Nueva venta" width={640}>
        <form onSubmit={handleSubmit(onNuevaSubmit)} noValidate>
          <div className="mb-1.5 text-xs font-bold text-muted-foreground">Artículos</div>
          <FilasItems
            rows={rows}
            rowErrors={rowErrors}
            options={articuloOptions}
            onChange={updateRow}
            onRemove={removeRow}
          />
          {itemsError && <p className="mt-1.5 text-xs text-danger">{itemsError}</p>}
          <Button type="button" variant="outline" size="xs" className="mt-2" onClick={addRow}>
            + Agregar artículo
          </Button>

          <div className="grid gap-3.5 mt-4">
            <Field label="Cliente">
              <Input placeholder="Nombre del cliente (opcional)" {...register('cliente')} />
            </Field>
            <Field label="Tipo de pago">
              <Controller
                control={control}
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
              <input type="checkbox" {...register('aprobado')} />
              Venta aprobada
            </label>
          </div>

          {crearMutation.isError && (
            <Alert style={{ marginTop: 14 }}>
              {errorMessage(crearMutation.error, 'Error al registrar la venta')}
            </Alert>
          )}

          <div className="flex gap-2.5 mt-5 justify-end">
            <Button type="button" variant="muted" size="sm" onClick={closeNueva}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={crearMutation.isPending}>
              {crearMutation.isPending ? 'Registrando…' : 'Registrar venta'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editando)}
        onClose={closeEditar}
        title={`Editar venta #${editando?.numero ?? ''}`}
        width={640}
      >
        {editando && (
          <div>
            <div className="mb-1.5 text-xs font-bold text-muted-foreground">Ítems de la venta</div>
            <FilasItems
              rows={rows}
              rowErrors={rowErrors}
              options={articuloOptions}
              onChange={updateRow}
              onRemove={removeRow}
            />
            {itemsError && <p className="mt-1.5 text-xs text-danger">{itemsError}</p>}
            <Button type="button" variant="outline" size="xs" className="mt-2" onClick={addRow}>
              + Agregar artículo
            </Button>

            <div className="grid gap-3.5 mt-4">
              <Field label="Cliente">
                <Input
                  placeholder="Nombre del cliente (opcional)"
                  value={clienteEdit}
                  onChange={(e) => setClienteEdit(e.target.value)}
                />
              </Field>
              <Field label="Tipo de pago (toda la venta)">
                <SearchableSelect
                  value={metodoEdit}
                  onChange={setMetodoEdit}
                  onBlur={() => {}}
                  options={metodoPagoOptions}
                  placeholder="Buscar tipo de pago…"
                  optional
                  noneLabel="Sin tipo de pago"
                />
              </Field>
            </div>

            {editarMutation.isError && (
              <Alert style={{ marginTop: 14 }}>
                {errorMessage(editarMutation.error, 'Error al guardar los cambios')}
              </Alert>
            )}

            <div className="flex gap-2.5 mt-5 justify-end">
              <Button type="button" variant="muted" size="sm" onClick={closeEditar}>
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={editarMutation.isPending || rows.length === 0 || Boolean(itemsError)}
                onClick={onEditarSubmit}
              >
                {editarMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
