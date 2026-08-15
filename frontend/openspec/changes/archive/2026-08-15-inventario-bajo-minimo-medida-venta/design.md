## Context

El backend ya expone `minimo_stock` y `medida_venta` en `InventarioOut` y el
endpoint `GET /api/v1/inventarios/bajo-minimo` (ver proposal.md - Why). El
frontend consume la API a través de `src/services/http.ts` (`API_BASE_URL =
http://127.0.0.1:8000/api/v1`), con queries de TanStack Query por hooks en
`src/hooks/useInventarios.ts` y tipos en `src/types/domain.ts`. La vista de
inventario (`src/pages/InventoryPage.tsx`) y el dashboard
(`src/pages/DashboardPage.tsx`) mapean `InventarioOut` a `InventarioRow` y a
KPIs respectivamente.

## Goals / Non-Goals

**Goals:**
- Consumir el endpoint de bajo mínimo para alimentar el KPI y el bloque de
  alertas del dashboard.
- Exponer `minimo_stock` y `medida_venta` en la tabla de inventario, en el alta
  y en la edición.
- Mantener la arquitectura por capas (types → services → hooks → páginas).

**Non-Goals:**
- No cambiar el backend ni agregar endpoints.
- No crear medidas de venta nuevas desde el formulario: `medida_venta_id` solo
  referencia medidas existentes.
- No tocar ventas, presupuestos, proveedores ni depósitos.

## Decisions

- **Tipos alineados con `InventarioOut`**: `InventarioOut` incorpora
  `minimo_stock: number` y `medida_venta: Medida | null`. `InventarioRow`
  agrega `minimo_stock`, `medida_venta` (texto compuesto de
  `unidad_medida` + `medida`) y `bajo_minimo: boolean` (derivado de
  `stock < minimo_stock`). `InventarioAltaPayload` agrega `minimo_stock` y
  `medida_venta_id`.
  - Alternativa considerada: agregar solo el id y resolver el texto en la
    página — descartada: el texto compuesto es el mismo patrón ya usado para
    `medida` en `InventarioRow`.
- **Nuevo servicio y hook**: `getInventariosBajoMinimo()` → `GET
  /inventarios/bajo-minimo` y `useInventariosBajoMinimo()` con queryKey
  `['inventarios', 'bajo-minimo']`. Las mutations existentes
  (`useAltaInventario`, `useActualizarInventario`, `useEliminarInventario`)
  invalidan también esa key para mantener el dashboard fresco tras cambios de
  stock o mínimo.
  - Alternativa considerada: calcular bajo mínimo en el cliente filtrando
    `useInventarios` — descartada por pedido del usuario: debe usarse el método
    nuevo del backend.
- **Dashboard**: el KPI "Stock bajo mínimo" usa `bajo_minimo.length`
  (formateado con `toLocaleString('es-AR')`) y el bloque de alertas renderiza
  nombre, `{stock} {unidad} de {minimo} mín.`, porcentaje
  (`min(stock/minimo*100, 100)`) y `ProgressBar` coloreada por umbral (rojo
  < 30%, ámbar en otro caso), igual que la renderización mock previa. Ante
  error o lista vacía → "Sin información" (no bloquea el resto de la página).
  - La unidad proviene de `medida` del ítem (`unidad_medida` + `medida`).
- **Inventario — tabla**: columna "Mínimo" (mono, `minimo_stock`); la celda de
  Stock muestra el valor en color de alerta y una insignia "Bajo stock" (Badge
  tint con `#C85A3A`) cuando `bajo_minimo`; la celda de P. Venta agrega el
  sufijo `/ {medida_venta}` cuando el ítem tiene medida de venta (decisión del
  usuario: sufijo en el precio, sin columna extra).
- **Inventario — formularios**: el alta agrega "Stock mínimo" (Input number
  ≥ 0) y "Medida de venta" (Select opcional alimentado por `useMedidas`),
  enviando `minimo_stock` y `medida_venta_id` en el payload. El modal de
  edición agrega los mismos dos campos precargados y envía `minimo_stock` y
  `medida_venta_id` en `updateInventario`.
  - `medida_venta_id` se envía como `null` cuando no se selecciona ninguna.

## Risks / Trade-offs

- [El conteo del KPI depende del tamaño del listado del endpoint (defaults
  skip 0, limit 100)] → Aceptable: el endpoint lista por defecto hasta 100
  ítems; si el set de bajo mínimo supera ese tope, el KPI puede subestimar.
- [El sufijo de unidad de venta puede quedar largo en la columna de precio] →
  Se mantiene compacto (texto corto de `unidad_medida`); la tabla ya maneja
  `whitespace-nowrap` solo donde es necesario.
- [Invalidar `['inventarios','bajo-minimo']` en cada mutation agrega requests]
  → Costo bajo; garantiza que el dashboard refleje el estado real tras cada
  alta/edición/baja.
