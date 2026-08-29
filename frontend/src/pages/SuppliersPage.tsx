import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/http'
import {
  useActualizarProveedor,
  useCrearProveedor,
  useEliminarProveedor,
  useProveedores,
} from '../hooks/useProveedores'
import { useCategorias } from '../hooks/useCategorias'
import type { Proveedor } from '../types/domain'
import Alert from '../components/ui/Alert'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import PageContainer from '../components/ui/PageContainer'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'

type ProveedorFormValues = {
  nombre: string
  apellido: string
  telefono: string
  direccion: string
}

export default function SuppliersPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'ADMIN'

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const proveedoresQuery = useProveedores()
  const categoriasQuery = useCategorias({ enabled: modalOpen })
  const crearMutation = useCrearProveedor()
  const actualizarMutation = useActualizarProveedor()
  const eliminarMutation = useEliminarProveedor()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProveedorFormValues>({
    defaultValues: { nombre: '', apellido: '', telefono: '', direccion: '' },
  })

  const mutationError = (() => {
    const err = crearMutation.error ?? actualizarMutation.error
    if (!err) return null
    return err instanceof ApiError ? err.message : err.message
  })()

  const eliminarError = (() => {
    if (!eliminarMutation.error) return null
    return eliminarMutation.error instanceof ApiError ? eliminarMutation.error.message : eliminarMutation.error.message
  })()

  const proveedoresError = (() => {
    if (!proveedoresQuery.error) return null
    return proveedoresQuery.error instanceof ApiError ? proveedoresQuery.error.message : proveedoresQuery.error.message
  })()

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = proveedoresQuery.data ?? []
    if (!term) return list
    return list.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.apellido.toLowerCase().includes(term) ||
        p.telefono.toLowerCase().includes(term),
    )
  }, [search, proveedoresQuery.data])

  const openCreate = () => {
    setEditing(null)
    reset({ nombre: '', apellido: '', telefono: '', direccion: '' })
    setSelectedCategoryIds([])
    setModalOpen(true)
  }

  const openEdit = (p: Proveedor) => {
    setEditing(p)
    reset({ nombre: p.nombre, apellido: p.apellido, telefono: p.telefono, direccion: p.direccion ?? '' })
    setSelectedCategoryIds(p.categorias.map((c) => c.id))
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    reset()
    setSelectedCategoryIds([])
  }

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  const onSubmit = (values: ProveedorFormValues) => {
    const payload = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      telefono: values.telefono.trim(),
      direccion: values.direccion.trim() || null,
      categoria_ids: selectedCategoryIds,
    }
    const onSuccess = () => closeModal()
    if (editing) {
      actualizarMutation.mutate({ id: editing.id, data: payload }, { onSuccess })
    } else {
      crearMutation.mutate(payload, { onSuccess })
    }
  }

  const handleDelete = (p: Proveedor) => {
    if (!window.confirm(`¿Eliminar al proveedor ${p.nombre} ${p.apellido}?`)) return
    eliminarMutation.mutate(p.id)
  }

  if (proveedoresQuery.isPending) {
    return (
      <PageContainer>
        <EmptyState message="Cargando proveedores…" />
      </PageContainer>
    )
  }

  if (proveedoresQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="Proveedores" subtitle="No se pudieron cargar los proveedores desde el servidor" />
        <Alert size="md">{proveedoresError}</Alert>
      </PageContainer>
    )
  }

  const proveedores = proveedoresQuery.data ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Proveedores"
        subtitle={`${proveedores.length} proveedores registrados`}
        action={isAdmin ? <Button onClick={openCreate}>+ Nuevo proveedor</Button> : undefined}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, apellido o teléfono…"
        />
      </div>

      {eliminarError && <Alert style={{ marginBottom: 14 }}>{eliminarError}</Alert>}

      <div className="flex flex-col gap-3">
        {filtered.map((p) => (
          <Card key={p.id} style={{ padding: '18px 24px' }}>
            <div className="grid grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <Avatar name={`${p.nombre} ${p.apellido}`} size={36} />
                  <div>
                    <div className="font-bold text-[15px]">
                      {p.nombre} {p.apellido}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.telefono}</div>
                    {p.direccion && <div className="text-xs text-muted-foreground">{p.direccion}</div>}
                  </div>
                </div>
                {p.categorias.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {p.categorias.map((c) => (
                      <Badge key={c.id} variant="subtle" style={{ padding: '2px 8px' }}>
                        {c.nombre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(p)}
                    disabled={eliminarMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-3.5">
            <Field label="Nombre" error={errors.nombre?.message}>
              <Input placeholder="Ej: Jorge" {...register('nombre', { required: 'Ingresá el nombre' })} />
            </Field>
            <Field label="Apellido" error={errors.apellido?.message}>
              <Input placeholder="Ej: Blanco" {...register('apellido', { required: 'Ingresá el apellido' })} />
            </Field>
            <Field label="Teléfono" error={errors.telefono?.message}>
              <Input
                placeholder="Ej: 0341-4820011"
                {...register('telefono', { required: 'Ingresá el teléfono' })}
              />
            </Field>
            <Field label="Dirección">
              <Input placeholder="Dirección opcional" {...register('direccion')} />
            </Field>
            <Field label="Categorías">
              {categoriasQuery.isPending && (
                <div className="text-xs text-muted-foreground">Cargando categorías…</div>
              )}
              <div className="grid gap-1.5">
                {(categoriasQuery.data ?? []).map((c) => {
                  const checked = selectedCategoryIds.includes(c.id)
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(c.id)}
                        className="accent-[#4A6B8A]"
                      />
                      {c.nombre}
                    </label>
                  )
                })}
              </div>
            </Field>
          </div>

          {mutationError && <Alert style={{ marginTop: 14 }}>{mutationError}</Alert>}

          <div className="flex gap-2.5 mt-5 justify-end">
            <Button type="button" variant="muted" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={crearMutation.isPending || actualizarMutation.isPending}
            >
              {crearMutation.isPending || actualizarMutation.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  )
}
