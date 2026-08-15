## Why

El backend incorporó dos campos nuevos a cada ítem de inventario: `minimo_stock`
(stock mínimo antes de la alerta de reposición) y `medida_venta` (unidad sobre la
que se expresa el precio, p. ej. "por metro" o "por unidad"), más un endpoint
`GET /api/v1/inventarios/bajo-minimo`. El frontend aún no los consume: el dashboard
muestra el bloque "Stock bajo mínimo" sin datos y la vista de inventario no expone
el mínimo ni la unidad de venta, por lo que no se puede decidir reposición ni
expresar el precio en su unidad correspondiente.

## What Changes

- `src/types/domain.ts`: `InventarioOut` incorpora `minimo_stock` y `medida_venta`;
  `InventarioRow` incorpora `minimo_stock`, `medida_venta` (texto) y `bajo_minimo`;
  `InventarioAltaPayload` incorpora `minimo_stock` y `medida_venta_id`.
- `src/services/inventario.service.ts`: nuevo `getInventariosBajoMinimo()` contra
  `GET /inventarios/bajo-minimo`; `updateInventario` acepta `minimo_stock` y
  `medida_venta_id`.
- `src/hooks/useInventarios.ts`: nuevo hook `useInventariosBajoMinimo`; las
  mutations de inventario invalidan también la query de bajo mínimo.
- `src/pages/DashboardPage.tsx`: el KPI "Stock bajo mínimo" muestra el conteo real
  y el bloque de alertas lista los ítems bajo mínimo con su progreso.
- `src/pages/InventoryPage.tsx`: nueva columna "Mínimo", insignia "Bajo stock" para
  ítems con `stock < minimo_stock`, precio de venta con sufijo de la unidad de
  venta, y campos "Stock mínimo" y "Medida de venta" en el alta y la edición.

## Capabilities

### New Capabilities
<!-- Ninguna -->

### Modified Capabilities
- `inventario`: la vista de inventario incorpora el stock mínimo (columna, alta y
  edición, marcado de bajo stock) y la medida de venta (sufijo en el precio, alta
  y edición).
- `dashboard`: el KPI "Stock bajo mínimo" y el bloque de alertas se alimentan del
  endpoint `GET /inventarios/bajo-minimo`.

## Impact

- `src/types/domain.ts`, `src/services/inventario.service.ts`,
  `src/hooks/useInventarios.ts`, `src/pages/DashboardPage.tsx`,
  `src/pages/InventoryPage.tsx`.
- Depende de los cambios de backend ya aplicados: campos `minimo_stock` y
  `medida_venta` en `InventarioOut`, y endpoint `GET /api/v1/inventarios/bajo-minimo`.
- Sin cambios de esquema en base de datos.
