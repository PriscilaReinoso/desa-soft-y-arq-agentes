## Context

`SalesPage.tsx` consume el mock (`ventas`, `salesStatuses`, `statusColor` de `src/data/mock.ts`) y sus botones "Ver" y "+ Nueva venta" no hacen nada. El backend ya expone:

- `GET /api/v1/ventas?skip=&limit=` (JWT) → `VentaCabeceraOut[]`, cada venta con sus `detalles` ya agrupados (no hay que agrupar en cliente).
- `POST /api/v1/ventas` (ADMIN) → alta con `items[]` (`inventario_id`, `cantidad>0`, `metodo_pago_id` opcional), `aprobado`, `cliente`, `presupuesto_id`; valida stock suficiente.
- `PUT /api/v1/ventas/{venta_id}` (ADMIN) → si va `items`, **reemplaza el set completo de detalles**: restaura el stock de los ítems actuales, valida y descuenta stock para los nuevos y recalcula cantidad/total. `aprobado`, `cliente` y `presupuesto_id` se actualizan en forma independiente (aprobar no mueve stock).
- `DELETE /api/v1/ventas/{venta_id}` (ADMIN) → **borrado lógico** (`deleted_at`); el listado excluye las eliminadas. No restaura stock (decisión del backend, fuera de alcance).
- `GET /api/v1/inventarios` (JWT) → filas con `stock` para saber qué artículos tienen disponibilidad.
- `GET /api/v1/metodos-pago` (JWT) → métodos de pago (ya integrado por `useMetodosPago`).

Contrato a tener en cuenta: los montos (`total`, `precio_venta`, `sub_total`) llegan como **string decimal**; la venta no tiene estado tipo "En camino", solo `aprobado: boolean`. El change activo `alta-venta-desde-inventario` ya dejó implementados `createVenta`, `useCrearVenta` y el modal de venta por artículo en `InventoryPage.tsx` (patrón a replicar).

Ver proposal.md y specs/ventas/spec.md.

## Goals / Non-Goals

**Goals:**
- Listar ventas desde la API con carga/estado de error visibles, adaptando columnas y filtros al contrato real (`aprobado` → Aprobada/Pendiente).
- Modal "Ver" con el detalle completo de la venta usando los `detalles` incluidos en la respuesta.
- "+ Nueva venta" multi-artículo (filas artículo + cantidad, un tipo de pago para toda la venta) con validación de stock: solo artículos con stock > 0 y cantidad ≤ stock disponible, además del error de la API como red de seguridad.
- Gestión del estado y edición de ventas: estado editable con un desplegable en la columna Estado (todas las filas) y acción "Editar" que abre un editor completo de ítems (PUT con set completo); cancelar (DELETE, borrado lógico) queda solo en pendientes.
- Mantener el patrón service + hook + TanStack Query existente.

**Non-Goals:**
- Exportación PDF de ventas (el botón queda como placeholder visual, fuera de alcance).
- Restaurar stock al cancelar (el backend no lo hace; es decisión del backend).
- Paginación server-side (se usa `limit=100` inicial, igual que otras vistas).

## Decisions

- **Tipos fieles al contrato**: se renombra/reemplaza el mock `Venta` por tipos basados en la respuesta real. `VentaOut` pasa a reflejar `VentaCabeceraOut`: `total: string`, `numero`, `fecha`, `cliente: string | null`, `aprobado`, `detalles: VentaDetalleOut[]` (ya existente, se conserva). La conversión string→number se hace en la capa de vista con `Number(...)` justo antes de `formatCurrency`/sumas, sin mutar los tipos de API. *Alternativa descartada:* normalizar en el service — mezcla dos representaciones y complica el tipado fiel.
- **Estado derivado**: `estado = aprobado ? 'Aprobada' : 'Pendiente'`; píldoras "Todas / Aprobadas / Pendientes" reemplazan a `salesStatuses`. El color de insignia sale de un mapa local en la página (marrón/ámbar para Pendiente, verde para Aprobada), siguiendo la paleta cálida-neutra; `statusColor` del mock deja de usarse.
- **Service/hook**: `listVentas()` → `GET /ventas?skip=0&limit=100` en `ventas.service.ts`; hook `useVentas()` con queryKey `['ventas']`. `useCrearVenta` pasa a invalidar también `['ventas']` (además de inventarios) para que un alta desde cualquier vista refresque el listado.
- **Modal de detalle**: componente local en `SalesPage` (o archivo hermano si crece), estado `ventaDetalle: VentaOut | null`; usa los `detalles` que ya trae la fila — no llama a `GET /ventas/{id}` (evita un request extra; el listado ya trae todo). Tabla simple de ítems + cabecera con fecha/cliente/estado/total.
- **Modal de nueva venta (multi-artículo)**: react-hook-form con array de ítems manejado como lista en estado del componente (filas `{ inventario_id, cantidad }` agregables/quitables; mínimo 1 para enviar). Selector de artículo sobre `useInventarios()` filtrando `stock > 0` (label "artículo — medida · stock: N"), cantidad de cada fila validada `> 0 && <= stock` del artículo elegido. Un único "Tipo de pago" a nivel formulario (`useMetodosPago({ enabled })`) que se aplica a todos los ítems del payload; cliente opcional y check "Venta aprobada" por defecto en true. Payload: `items` con una entrada por fila y `presupuesto_id: null`.
- **Estado como desplegable editable** (ajuste post-verificación): la columna Estado renderiza un `<select>` nativo estilizado con las opciones Pendiente/Aprobada en **todas** las filas; al cambiarlo se envía `PUT { aprobado }` (deshabilitado mientras la mutación está en curso). Reemplaza a la insignia estática y al botón "Aprobar", que se elimina. Desaprobar (Aprobada → Pendiente) es inocuo: aprobar/desaprobar no mueve stock en el backend.
- **Editor de ventas ("Editar")** (ajuste post-verificación, reemplaza "Agregar ítems"): visible en todas las filas. Al abrir, las filas se precargan desde `detalles` resolviendo `inventario_id` por combinación artículo+medida contra `useInventarios` (si alguna no se resuelve, se bloquea el guardado con error visible en el modal). Todas las filas son editables: cambiar artículo, modificar cantidad y quitar; se pueden agregar filas nuevas (mínimo 1 para enviar). Un único tipo de pago para toda la venta, precargado con el método del primer ítem existente, aplicado a todos los ítems del payload; cliente editable. Confirmación → `PUT /ventas/{id}` con el set completo.
- **Validación de stock en edición**: como el backend restaura el stock de los ítems actuales antes de descontar el nuevo set, el límite por fila es `stock actual + cantidad original del artículo en la venta` (mapa inventario_id → cantidad original construido al abrir el editor). En alta pura el extra es 0.
- **Cancelar solo en pendientes**: confirmación previa y `DELETE /ventas/{id}` (borrado lógico; desaparece del listado). Las acciones de fila se muestran siempre en el mismo orden y posición, sin moverse según el estado: primero los íconos ghost lápiz (✎ editar) y tachito (🗑 cancelar, con `aria-label`, deshabilitado en aprobadas en lugar de ocultarse), luego "Ver" y "PDF" juntos. Mediante hooks `useActualizarVenta`/`useEliminarVenta` que invalidan `['ventas']` e `['inventarios']` (el stock cambia al editar ítems; invalidar en cambio de estado/cancelar es inocuo y mantiene consistencia).
- **Errores de acciones de fila**: un estado de error compartido se muestra en un `Alert` sobre la tabla (los errores de modales quedan dentro de cada modal), sin cerrar modales ni perder filtros.
- **Validación de stock en dos capas**: react-hook-form valida contra el stock de la fila elegida (mensaje "El stock disponible es N"); si la API devuelve 422 por carrera de stock, `ApiError.message` se muestra en el `Alert` del modal sin cerrarlo.
- **Carga y error del listado**: `isLoading` → texto "Cargando ventas…"; `isError` → `Alert` con el mensaje y la tabla no se renderiza; lista vacía → `EmptyState`.
- **Limpieza de mock**: se eliminan de `mock.ts` las exportaciones `ventas`, `salesStatuses` y `statusColor` y de `domain.ts` el tipo mock `Venta`/`VentaStatus` (solo los usaba SalesPage); el resto del mock queda intacto (Budgets/Dashboard/Assistant).

## Risks / Trade-offs

- [Montos como string] → Se convierte con `Number()` en render; si la API enviara formatos no parseables se mostraría NaN — riesgo bajo porque el contrato fija patrón decimal.
- [Listado sin paginación visible] → Con `limit=100` alcanza para la operación actual; la paginación real queda para otro change.
- [PUT reemplaza el set completo de ítems] → Última escritura gana: si otra sesión editó la venta mientras tanto, sus cambios se pisan. Aceptable para la operación actual (un solo ADMIN).
- [Cancelar no restaura stock] → Comportamiento del backend (`soft_delete` sin devolución de stock); visible para el usuario como diferencia entre stock esperado y real. Queda documentado, fuera de alcance del frontend.
- [Resolución de `inventario_id` de ítems existentes por combinación artículo+medida] → Si no existe la fila de inventario combinada (fue eliminada), el editor bloquea el guardado con error visible y el PUT no se envía; la venta queda intacta.
- [Stock desactualizado entre apertura y confirmación] → La validación client-side es orientativa; la API sigue siendo la fuente de verdad y su error se muestra en el modal.
- [Tipo de pago único pisa métodos mixtos al editar] → Si una venta tuviera métodos de pago distintos por ítem (creada fuera de esta vista), editarla los unifica con el elegido en el modal. Aceptable: el modelo de esta vista es un método por venta.

## Migration Plan

- Cambio frontend-only: se modifica `SalesPage.tsx`, `ventas.service.ts`, `useVentas.ts`, `domain.ts` y `mock.ts`. Sin migraciones ni cambios de backend.
- Rollback: revertir los archivos; el mock vuelve a alimentar la vista.

## Open Questions

None.
