## Why

La vista de proveedores usa datos mock mientras el backend ya expone el CRUD de proveedores vía API. `docs/spec.md` exige que la vista consuma la API y permita alta, edición y gestión de categorías.

## What Changes

- La vista de proveedores pasa a consumir `GET /api/v1/proveedores` (JWT) en lugar del mock `proveedores` de `src/data/mock.ts`.
- Alta de proveedor vía `POST /api/v1/proveedores` desde un modal con nombre, apellido, teléfono (requeridos), dirección opcional y categorías opcionales.
- Edición de proveedor vía `PUT /api/v1/proveedores/{id}` con las categorías como checkboxes precargadas; al guardar se envía `categoria_ids` completo, permitiendo agregar o quitar categorías.
- Baja lógica de proveedor vía `DELETE /api/v1/proveedores/{id}` con confirmación previa; el proveedor desaparece del listado.
- Las acciones de alta, edición y baja se muestran únicamente para el rol ADMIN (la API responde 403 en caso contrario).
- La tarjeta se rediseña con datos de la API: avatar con iniciales, nombre y apellido, teléfono, dirección y categorías como etiquetas. Se eliminan "último pedido", "saldo" y "rating" porque no existen en la API.
- La búsqueda filtra por nombre, apellido o teléfono.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
None

### Modified Capabilities
- `proveedores`: la vista pasa de datos mock a datos de la API; se modifican los requirements de encabezado/alta, búsqueda y tarjetas, y se agregan los de alta, edición y baja de proveedor con categorías.

## Impact

- `src/types/domain.ts`: el tipo `Proveedor` mock se reemplaza por el shape de la API (`id`, `nombre`, `apellido`, `telefono`, `direccion`, `categorias`) y se agregan payloads con `categoria_ids`.
- Nuevo `src/services/proveedores.service.ts`: `listProveedores`, `getProveedor`, `createProveedor`, `updateProveedor`, `deleteProveedor`.
- Nuevo `src/hooks/useProveedores.ts`: queries y mutations con invalidación de `['proveedores']`.
- `src/pages/SuppliersPage.tsx`: consume el hook, agrega modal de alta/edición, checkboxes de categorías (vía `useCategorias`) y baja con confirmación.
- Sin cambios en el backend.
