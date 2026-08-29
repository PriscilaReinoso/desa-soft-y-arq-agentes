## Why

La vista de ventas (`SalesPage.tsx`) sigue mostrando datos mock (`src/data/mock.ts`) aunque el backend ya expone `GET /api/v1/ventas`, que devuelve cada venta con sus detalles agrupados. Además el botón "Ver" no hace nada, el botón "+ Nueva venta" no está funcional y el alta de ventas debe respetar el stock disponible de los artículos.

## What Changes

- La tabla de ventas consume `GET /api/v1/ventas` (TanStack Query) en lugar del mock; se elimina la dependencia de `ventas` y `salesStatuses` de `src/data/mock.ts`.
- Las columnas se adaptan a los datos reales de la API: número, fecha, cliente, cantidad de artículos, total, estado (derivado de `aprobado`: Aprobada / Pendiente) y acciones.
- Las píldoras de filtro pasan a ser "Todas / Aprobadas / Pendientes" (según `aprobado`) y el total del encabezado se recalcula sobre lo filtrado.
- El botón "Ver" abre un modal con el detalle completo de la venta: fecha, cliente, estado, y por ítem artículo, medida, cantidad, precio unitario, subtotal y método de pago, más el total general.
- El botón "+ Nueva venta" abre un formulario de alta que envía `POST /api/v1/ventas` (mismo contrato que el alta desde inventario) con **uno o más artículos**: filas artículo + cantidad agregables, con el tipo de pago elegido una vez para toda la venta. Solo se pueden seleccionar artículos con stock mayor a 0 (`GET /api/v1/inventarios`) y la cantidad de cada ítem no puede superar el stock disponible.
- Las ventas **pendientes** (`aprobado: false`) exponen tres acciones en la fila:
  - **Agregar ítems**: modal que lista los ítems actuales (solo lectura) y permite sumar filas artículo + cantidad; confirma con `PUT /api/v1/ventas/{id}` reenviando el set completo (existentes preservan su método de pago, los nuevos llevan el del formulario).
  - **Aprobar**: envía `PUT /api/v1/ventas/{id}` con `aprobado: true`.
  - **Cancelar**: tras confirmación, envía `DELETE /api/v1/ventas/{id}` (borrado lógico; la venta desaparece del listado).
- Ante stock insuficiente u otro error de la API, el mensaje se muestra en el modal (o junto a la tabla para acciones de fila) sin perder el estado.
- Tras un alta, edición de ítems, aprobación o cancelación exitosa se refrescan las ventas y el inventario.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `ventas`: se modifican las requirements "Encabezado con total filtrado", "Filtro por estado" y "Tabla de ventas" para consumir la API real (estados derivados de `aprobado`); se agregan las requirements "Detalle de venta" (modal Ver), "Alta de venta desde la vista" (multi-artículo con validación de stock) y "Gestión de ventas pendientes" (agregar ítems, aprobar, cancelar).

## Impact

- `src/pages/SalesPage.tsx`: reescritura para usar queries/mutations, modales de detalle, alta multi-artículo y acciones de fila (agregar ítems, aprobar, cancelar).
- `src/services/ventas.service.ts`: se agregan `listVentas()`, `updateVenta()` y `deleteVenta()`.
- `src/hooks/useVentas.ts`: se agregan `useVentas()`, `useActualizarVenta()` y `useEliminarVenta()`; `useCrearVenta` invalida también `['ventas']`.
- `src/types/domain.ts`: tipos de ventas alineados al contrato real (`VentaCabeceraOut` con `total` decimal como string, `detalles` incluidos); se elimina el tipo mock `Venta`/`VentaStatus` si ninguna otra vista lo usa.
- `src/data/mock.ts`: quedan sin uso las exportaciones de ventas (se limpian).
- API consumida: `GET /api/v1/ventas` (JWT), `POST /api/v1/ventas` (ADMIN), `PUT /api/v1/ventas/{id}` (ADMIN), `DELETE /api/v1/ventas/{id}` (ADMIN), `GET /api/v1/inventarios` (JWT), `GET /api/v1/metodos-pago` (JWT). Sin cambios en el backend.
