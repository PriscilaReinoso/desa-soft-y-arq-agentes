import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/http'
import { getDeposito } from '../services/depositos.service'
import { createEspacio, deleteEspacio, updateEspacio } from '../services/espacios.service'
import { useActualizarDeposito, useCrearDeposito, useDepositos } from '../hooks/useDepositos'
import type { Deposito } from '../types/domain'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import PageContainer from '../components/ui/PageContainer'
import PageHeader from '../components/ui/PageHeader'

type DepositoFormValues = {
  nombre: string
  descripcion: string
  direccion: string
}

type EspacioRow = {
  key: string
  id?: string
  tipo: string
  descripcion: string
  max_fila: string
  max_columna: string
}

export default function DepositsPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'ADMIN'
  const queryClient = useQueryClient()
  const keyRef = useRef(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Deposito | null>(null)
  const [espacios, setEspacios] = useState<EspacioRow[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [espaciosLoading, setEspaciosLoading] = useState(false)
  const [espaciosError, setEspaciosError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const depositosQuery = useDepositos()
  const crearMutation = useCrearDeposito()
  const actualizarMutation = useActualizarDeposito()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositoFormValues>({
    defaultValues: { nombre: '', descripcion: '', direccion: '' },
  })

  const mutationError = (() => {
    const err = crearMutation.error ?? actualizarMutation.error
    if (!err) return null
    return err instanceof ApiError ? err.message : err.message
  })()

  const depositosError = (() => {
    if (!depositosQuery.error) return null
    return depositosQuery.error instanceof ApiError ? depositosQuery.error.message : depositosQuery.error.message
  })()

  const addEspacioRow = () => {
    keyRef.current += 1
    setEspacios((rows) => [
      ...rows,
      { key: `nuevo-${keyRef.current}`, tipo: '', descripcion: '', max_fila: '', max_columna: '' },
    ])
  }

  const updateEspacioRow = (key: string, patch: Partial<EspacioRow>) => {
    setEspacios((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const removeEspacioRow = (row: EspacioRow) => {
    const id = row.id
    if (id) setDeletedIds((ids) => [...ids, id])
    setEspacios((rows) => rows.filter((r) => r.key !== row.key))
  }

  const openCreate = () => {
    setEditing(null)
    reset({ nombre: '', descripcion: '', direccion: '' })
    setEspacios([])
    setDeletedIds([])
    setEspaciosError(null)
    setEspaciosLoading(false)
    setSubmitting(false)
    setModalOpen(true)
  }

  const openEdit = (d: Deposito) => {
    setEditing(d)
    reset({ nombre: d.nombre, descripcion: d.descripcion ?? '', direccion: d.direccion ?? '' })
    setEspacios([])
    setDeletedIds([])
    setEspaciosError(null)
    setSubmitting(false)
    setEspaciosLoading(true)
    setModalOpen(true)
    getDeposito(d.id)
      .then((detalle) => {
        setEspacios(
          (detalle.espacios ?? []).map((e) => ({
            key: e.id,
            id: e.id,
            tipo: e.tipo ?? '',
            descripcion: e.descripcion ?? '',
            max_fila: e.max_fila != null ? String(e.max_fila) : '',
            max_columna: e.max_columna != null ? String(e.max_columna) : '',
          })),
        )
        setEspaciosLoading(false)
      })
      .catch((err) => {
        setEspaciosError(err instanceof ApiError ? err.message : String(err))
        setEspaciosLoading(false)
      })
  }

  const closeModal = () => {
    setModalOpen(false)
    reset()
    setEspacios([])
    setDeletedIds([])
    setEspaciosError(null)
    setSubmitting(false)
  }

  const persistEspacios = async (depositoId: string) => {
    try {
      for (const id of deletedIds) {
        await deleteEspacio(id)
      }
      for (const row of espacios) {
        const max_fila = Math.max(0, parseInt(row.max_fila, 10) || 0)
        const max_columna = Math.max(0, parseInt(row.max_columna, 10) || 0)
        if (row.id) {
          await updateEspacio(row.id, {
            tipo: row.tipo.trim() || null,
            descripcion: row.descripcion.trim() || null,
            max_fila,
            max_columna,
          })
        } else {
          await createEspacio({
            tipo: row.tipo.trim() || null,
            descripcion: row.descripcion.trim() || null,
            deposito_id: depositoId,
            max_fila,
            max_columna,
          })
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['depositos'] })
      closeModal()
    } catch (err) {
      setEspaciosError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = (values: DepositoFormValues) => {
    const payload = {
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim() || null,
      direccion: values.direccion.trim() || null,
    }
    setSubmitting(true)
    const onSuccess = (dep: Deposito) => {
      void persistEspacios(dep.id)
    }
    const onError = () => setSubmitting(false)
    if (editing) {
      actualizarMutation.mutate({ id: editing.id, data: payload }, { onSuccess, onError })
    } else {
      crearMutation.mutate(payload, { onSuccess, onError })
    }
  }

  if (depositosQuery.isPending) {
    return (
      <PageContainer>
        <EmptyState message="Cargando depósitos…" />
      </PageContainer>
    )
  }

  if (depositosQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="Depósitos" subtitle="No se pudieron cargar los depósitos desde el servidor" />
        <Alert size="md">{depositosError}</Alert>
      </PageContainer>
    )
  }

  const depositos = depositosQuery.data ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Depósitos"
        subtitle={`${depositos.length} depósitos activos`}
        action={isAdmin ? <Button onClick={openCreate}>+ Nuevo depósito</Button> : undefined}
      />

      <div className="grid grid-cols-2 gap-4">
        {depositos.map((d) => (
          <Card key={d.id} style={{ padding: 24 }}>
            <div className="font-extrabold text-base mb-0.5">{d.nombre}</div>
            {d.descripcion && <div className="text-xs text-muted-foreground mb-1">{d.descripcion}</div>}
            <div className="text-xs text-muted-foreground mb-3.5">
              {d.direccion ? `📍 ${d.direccion}` : '📍 Sin dirección'}
            </div>
            <div className="bg-muted rounded-lg px-3 py-2.5 mb-4">
              <div className="text-xl font-extrabold font-mono text-primary">{d.cantidad_espacios}</div>
              <div className="text-[11px] text-muted-foreground font-semibold">espacios</div>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(d)}>
                Editar
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar depósito' : 'Nuevo depósito'}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-3.5">
            <Field label="Nombre" error={errors.nombre?.message}>
              <Input
                placeholder="Ej: Depósito Norte"
                {...register('nombre', { required: 'Ingresá un nombre' })}
              />
            </Field>
            <Field label="Descripción">
              <Input placeholder="Descripción opcional" {...register('descripcion')} />
            </Field>
            <Field label="Dirección">
              <Input placeholder="Dirección opcional" {...register('direccion')} />
            </Field>

            {isAdmin && (
              <div className="rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-sm font-bold">Espacios</div>
                  <Button type="button" variant="outline" size="sm" onClick={addEspacioRow}>
                    + Agregar espacio
                  </Button>
                </div>
                {espaciosLoading && <div className="text-xs text-muted-foreground mb-2">Cargando espacios…</div>}
                {espaciosError && <Alert style={{ marginBottom: 10 }}>{espaciosError}</Alert>}
                {espacios.length === 0 && !espaciosLoading && (
                  <div className="text-xs text-muted-foreground mb-2">Sin espacios cargados.</div>
                )}
                <div className="grid gap-2">
                  {espacios.map((row) => (
                    <div key={row.key} className="rounded-md bg-muted p-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Tipo"
                          value={row.tipo}
                          onChange={(e) => updateEspacioRow(row.key, { tipo: e.target.value })}
                        />
                        <Input
                          placeholder="Descripción"
                          value={row.descripcion}
                          onChange={(e) => updateEspacioRow(row.key, { descripcion: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 items-center">
                        <Input
                          placeholder="Filas"
                          inputMode="numeric"
                          value={row.max_fila}
                          onChange={(e) => updateEspacioRow(row.key, { max_fila: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Columnas"
                              inputMode="numeric"
                              value={row.max_columna}
                              onChange={(e) => updateEspacioRow(row.key, { max_columna: e.target.value })}
                            />
                          </div>
                          <Button type="button" variant="muted" size="sm" onClick={() => removeEspacioRow(row)}>
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {mutationError && <Alert style={{ marginTop: 14 }}>{mutationError}</Alert>}

          <div className="flex gap-2.5 mt-5 justify-end">
            <Button type="button" variant="muted" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || crearMutation.isPending || actualizarMutation.isPending}
            >
              {submitting || crearMutation.isPending || actualizarMutation.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  )
}
