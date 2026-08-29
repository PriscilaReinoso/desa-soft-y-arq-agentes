## Context

La vista de proveedores actual (`SuppliersPage.tsx`) renderiza el mock `proveedores` de `src/data/mock.ts` (campos `name`, `contact`, `email`, `phone`, `categories[]`, `lastOrder`, `balance`, `rating`) sin operaciones de alta/edición. El backend ya expone el CRUD en `/api/v1/proveedores` (todos los endpoints requieren JWT; POST/PUT/DELETE requieren rol ADMIN). El shape de la API difiere del mock: `{ id, nombre, apellido, telefono, direccion, categorias: [{id, nombre, descripcion}] }`, y las escrituras usan `categoria_ids: uuid[]` que reemplazan el set completo de asociaciones. El frontend ya cuenta con `categorias.service.ts`, `useCategorias.ts`, el patrón service+hook (ver `depositos.service.ts`/`useDepositos.ts`) y una página de referencia que combina listado por query + modal de alta/edición con `react-hook-form` (`DepositsPage.tsx`).

Ver proposal.md para la motivación y specs/proveedores/spec.md para los requisitos de comportamiento.

## Goals / Non-Goals

**Goals:**
- Reemplazar el mock por datos de la API respetando el patrón service + hook + query/mutations existente.
- Alta, edición y baja lógica de proveedores con gating de rol ADMIN.
- Gestión de categorías vía `categoria_ids` completo (agrega/quita).
- Tarjeta alineada con los datos que provee la API.

**Non-Goals:**
- Paginación en el frontend (la API pagine con `skip/limit` por defecto; se listan los primeros 100).
- Eliminar físicamente proveedores (el backend solo hace baja lógica).
- Búsqueda server-side.
- Cambios en el backend ni en `docs/spec.md`.

## Decisions

- **Tipo `Proveedor` de API**: se reemplaza el tipo mock por `{ id, nombre, apellido, telefono, direccion: string|null, categorias: Categoria[] }` y se agregan payloads `ProveedorCreatePayload`/`ProveedorUpdatePayload` con `categoria_ids: string[]`. *Alternativa descartada:* mantener el tipo mock y mapear — añade fricción y no refleja el contrato real.
- **Categorías como checkboxes** en el modal, cargadas desde `useCategorias()` y preseleccionadas al editar a partir de `proveedor.categorias`. Al guardar se envía `categoria_ids` (el backend reemplaza el set, cubriendo agregar/quitar). *Alternativa descartada:* un `Select` múltiple nativo, por consistencia visual con el resto de la UI y mejor usabilidad.
- **Gating por rol**: `const isAdmin = usuario?.rol === 'ADMIN'`, igual que `DepositsPage`. Se ocultan "+ Nuevo proveedor", "Editar" y "Eliminar" para no-admin; el backend además rechaza con 403.
- **Invalidación de query**: cada mutation invalida `['proveedores']` en el `QueryClient` (patrón `useDepositos`), refrescando el listado tras alta/edición/baja.
- **Baja con confirmación**: `window.confirm(...)` antes de llamar a `deleteProveedor`; cancelación no dispara la llamada.
- **Errores**: se muestran vía `ApiError.message` (409 duplicados, 400 categoría inválida, 403, 404) tanto en el listado como dentro del modal, siguiendo el patrón de `DepositsPage`.

## Risks / Trade-offs

- [No-admin intenta operar] → La UI oculta las acciones y, si se fuerza el request, la API responde 403 y se muestra el mensaje.
- [Duplicados 409 / categoría inválida 400] → Se muestra `ApiError.message` y el modal permanece abierto sin perder los datos.
- [Editar un proveedor que fue dado de baja en otra pestaña → 404] → Se muestra el error y se invalida el listado para que desaparezca.
- [El mock `proveedores` y tipos asociados quedan sin uso] → Se elimina el uso en la página; el resto de datos mock de `mock.ts` no se toca.

## Migration Plan

- Cambio frontend-only, sin migración de datos ni de backend.
- Rollback: revertir los archivos afectados (types, servicio, hook, página); no hay cambios en otros subsistemas.

## Open Questions

None.
