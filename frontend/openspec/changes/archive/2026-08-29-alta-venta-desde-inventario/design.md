## Context

La vista de inventario (`InventoryPage.tsx`) muestra en cada fila un botón de carrito (🛒) actualmente deshabilitado (líneas ~427-435) con el título "Disponibilidad futura". El backend ya expone `POST /api/v1/ventas` (requiere ADMIN; descuenta stock; valida cantidad > 0, stock suficiente, método de pago existente; `items` con `metodo_pago_id` a nivel ítem) y `GET /api/v1/metodos-pago` (JWT, devuelve `[{ id, nombre, descripcion }]`). El frontend no tiene aún servicio/hook de ventas ni de métodos de pago. Existe un tipo mock `Venta` en `domain.ts` usado por la vista de ventas/dashboard que NO se toca.

Ver proposal.md para la motivación y specs/{ventas,inventario}/spec.md para los requisitos de comportamiento.

## Goals / Non-Goals

**Goals:**
- Habilitar el carrito de inventario para abrir un formulario de alta de venta y enviar `POST /api/v1/ventas` con `presupuesto_id: null`, `aprobado` según el check "Venta aprobada", cantidad obligatoria, cliente opcional y método de pago buscable.
- Poblar el desplegable de métodos de pago desde la API y refrescar el stock tras el alta.
- Mantener el patrón service + hook + query/mutations existente.

**Non-Goals:**
- Vista de listado de ventas, edición, baja ni detalle de ventas (existe spec aparte para el listado; no se toca).
- Alta de venta con múltiples artículos en un solo formulario (el form es por artículo).
- ABM de métodos de pago (solo lectura para este cambio).

## Decisions

- **Tipos nuevos sin reutilizar el mock**: se agregan `MetodoPago`, `VentaOut`, `VentaDetalleOut`, `ItemVentaPayload` y `VentaCreatePayload`; se reutilizan `Articulo` y `Medida` (coinciden con `ArticuloOut`/`MedidaOut`). El mock `Venta` (estado/cliente) queda intacto porque alimenta otra vista. *Alternativa descartada:* renombrar el mock — rompe la vista existente sin aportar valor.
- **Service `ventas.service.ts` mínimo**: `createVenta(payload: VentaCreatePayload)` → `POST /ventas`. No se agregan `list/get/update/delete` (YAGNI; el listado de ventas es otro change). El hook `useCrearVenta` invalida `['inventarios']` y `['inventarios','bajo-minimo']` (el backend descuenta stock), siguiendo `useAltaInventario`.
- **Service `metodosPago.service.ts`**: `listMetodosPago()` → `GET /metodos-pago`, con hook `useMetodosPago({ enabled })` que solo se dispara al abrir el modal, igual que `useMedidas`/`useCategorias` en el alta de inventario.
- **Modal de alta de venta en `InventoryPage`**: estado `ventaArticulo: InventarioRow | null` controla la apertura (patrón del modal de edición). Form `react-hook-form` con `cantidad` (number, `valueAsNumber`, validación `> 0` requerida), `cliente` (opcional), `metodo_pago_id` (opcional, `SearchableSelect` desde `useMetodosPago`, placeholder "Buscar método de pago…") y `aprobado` (checkbox nativo con etiqueta "Venta aprobada", `defaultValue: true`).
- **Payload**: `{ items: [{ inventario_id: id, cantidad: Number(cantidad), metodo_pago_id: metodo_pago_id || null }], aprobado, cliente: cliente?.trim() || null, presupuesto_id: null }`. `presupuesto_id: null` siempre, tal como exige docs/spec.md.
- **Errores y éxito**: error de la mutation (`ApiError.message`) se muestra dentro del modal sin cerrarlo (stock insuficiente → 422, ítem inexistente → 400, no-admin → 403); al éxito se cierra el modal y el stock se refresca por la invalidación del hook. No se crea componente Checkbox: no existe en la librería de UI y un `input` nativo es suficiente.
- **Carrito visible para todos los roles**: coincide con el comportamiento actual del botón y con docs/spec.md. Un no-ADMIN que confirme recibe el 403 de la API en el modal (misma mecánica de errores). *Alternativa descartada:* ocultar el carrito a no-admin — contradice docs/spec.md, que no restringe el botón.

## Risks / Trade-offs

- [No-admin ve el carrito y recibe 403 al confirmar] → El error se muestra en el modal; se consideró ocultarlo, pero docs/spec.md no lo restringe.
- [`metodo_pago_id` es por ítem en la API, no por cabecera] → El formulario es de un solo artículo, así que se mapea el método elegido al único ítem; si a futuro se soportan varios artículos, habría que decidir un método por ítem.
- [El tipo mock `Venta` y el nuevo `VentaOut` coexisten] → Nombres distintos para evitar colisiones; el cambio de listado migrará su propio tipo cuando corresponda.
- [Modal reutiliza estados del alta/edición de inventario] → Estados separados (`ventaArticulo`) para no mezclar formularios ni resetear el alta inline.

## Migration Plan

- Cambio frontend-only: se agregan archivos nuevos y se modifica `InventoryPage.tsx` y `domain.ts`. No hay migración de datos.
- Rollback: revertir los archivos modificados; el backend ya soporta el flujo completo.

## Open Questions

None.
