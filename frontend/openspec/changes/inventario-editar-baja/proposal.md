## Why

La vista de inventario ya muestra los artículos reales de la API (change `inventario-api`), pero no permite editar ni eliminar registros. El caso de uso requiere botones de edición, baja y "añadir a preventa" por artículo, solo con íconos y a la derecha del artículo. El backend ya expone `PUT /api/v1/inventarios/{id}` y `DELETE /api/v1/inventarios/{id}`.

## What Changes

- Agregar a la tabla de inventario una columna de acciones a la derecha con botones solo-ícono (sin texto): editar, añadir a preventa y eliminar.
- El botón de editar abre un modal precargado con el registro para actualizar ubicación (espacio, fila, columna), stock y precio de venta mediante `PUT /api/v1/inventarios/{id}`; artículo y medida no se editan (no lo soporta la API).
- El botón de añadir a preventa queda como placeholder deshabilitado ("futura disponibilidad"), sin funcionalidad en esta iteración.
- El botón de eliminar pide confirmación y envía `DELETE /api/v1/inventarios/{id}`, refrescando el listado.
- Los botones de edición y baja se muestran únicamente al rol ADMIN (el backend los restringe).
- Se incorpora el componente `Modal` compartido con `depositos-datos-api`.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `inventario`: se agregan requisitos de edición y baja por artículo (botones de íconos a la derecha, modal de edición, baja con confirmación y placeholder de preventa).

## Impact

- `src/pages/InventoryPage.tsx`: columna de acciones, modal de edición y confirmación de baja.
- `src/hooks/useInventarios.ts`: nuevos hooks `useActualizarInventario` y `useEliminarInventario` (useMutation que invalidan `['inventarios']`).
- `src/services/inventario.service.ts`: ya contiene `updateInventario` y `deleteInventario`, no requiere cambios.
- `src/components/ui/Modal.tsx`: componente de modal compartido (se crea en este change o en `depositos-datos-api`).
- Sin cambios en el backend: PUT y DELETE de inventario ya existen (ADMIN).
