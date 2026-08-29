## Why

El botón de carrito de la vista de inventario está deshabilitado (pensado como "disponibilidad futura"), pero `docs/spec.md` ya define que desde allí se debe dar de alta una venta usando la API (`POST /api/v1/ventas`), que hoy ya está implementada en el backend. El frontend no tiene aún ninguna integración con el módulo de ventas ni con métodos de pago.

## What Changes

- El botón de carrito de cada fila de inventario pasa a estar habilitado y abre un formulario de alta de venta para ese artículo.
- El formulario pide: cantidad vendida (obligatoria), nombre de cliente (opcional), tipo de pago (desplegable buscable con los métodos de pago de la API) y un check "Venta aprobada" activo por defecto.
- Al confirmar se envía `POST /api/v1/ventas` con `items` (un ítem con `inventario_id`, `cantidad` y `metodo_pago_id` seleccionado), `aprobado` según el check, `cliente` opcional y `presupuesto_id: null`.
- Ante stock insuficiente u otro error de la API, se muestra el mensaje y el formulario permanece abierto.
- Se agrega integración con `GET /api/v1/metodos-pago` para poblar el desplegable.
- Tras una venta exitosa se refresca el listado de inventario (el backend descuenta stock).

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `ventas`: nueva requerimiento "Alta de venta desde inventario" (formulario, envío a `POST /api/v1/ventas` con `presupuesto_id: null` y `aprobado` por check, errores de stock).
- `inventario`: cambia la requirement "Acciones por artículo" — el botón de carrito deja de ser "añadir a preventa deshabilitado" y pasa a abrir el formulario de alta de venta.

## Impact

- `src/pages/InventoryPage.tsx`: habilitar el botón de carrito y agregar el modal de alta de venta (form con cantidad, cliente, tipo de pago y check "Venta aprobada").
- Nuevos archivos: `src/services/ventas.service.ts`, `src/hooks/useVentas.ts`, `src/services/metodosPago.service.ts`, `src/hooks/useMetodosPago.ts`.
- `src/types/domain.ts`: tipos `VentaOut`, `VentaDetalleOut`, `ItemVentaPayload`, `VentaCreatePayload` y `MetodoPago`.
- API consumida: `POST /api/v1/ventas` (ADMIN), `GET /api/v1/metodos-pago` (JWT). Sin cambios en el backend.
