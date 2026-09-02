## Why

La vista de inicio (dashboard) todavía muestra datos "Sin información" en tres
de sus KPIs y en la lista de ventas recientes, porque asumía que el backend no
exponía datos de ventas. El backend ya expone el resumen de ventas por periodo
(`GET /api/v1/ventas/estadisticas?periodo=mes|dia|...`) y el listado de ventas
(`GET /api/v1/ventas`), por lo que el inicio debe mostrar métricas reales y
ventas recientes en lugar de placeholders, y ajustar las etiquetas pedidas.

Requerimiento de origen: [IF-37](https://reinoso-yesica-priscila.atlassian.net/browse/IF-37)
— "vista de inicio" (Epic IF-4 "CRUD de entidades del sistema").

## What Changes

- **KPI "Ventas del mes"**: deja de mostrar "Sin información" y muestra el
  total de ventas del mes actual, obtenido de
  `GET /api/v1/ventas/estadisticas?periodo=mes`.
- **KPI "Órdenes pendientes" → renombrado a "Ventas del día"**: muestra el
  total de ventas del día actual, obtenido de
  `GET /api/v1/ventas/estadisticas?periodo=dia`.
- **KPI "Stock bajo mínimo" → renombrado a "Artículos stock bajo"**: conserva
  el dato real de stock bajo mínimo del inventario.
- **Sección "Ventas recientes"**: muestra las 5 ventas más recientes (una fila
  por venta: fecha, artículo, cantidad y total), ordenadas por fecha
  descendente, en lugar del estado vacío "Sin información disponible". El
  enlace "Ver todas" se mantiene.
- Manejo de fallo: si un dato de ventas no está disponible (error o
  inactividad del backend), los KPIs de ventas y la lista de ventas recientes
  muestran "Sin información" sin romper el resto del dashboard.

## Capabilities

### New Capabilities

- `dashboard`: vista de inicio (página de bienvenida) que resume la operación
  del día con KPIs, ventas recientes y alertas de stock bajo.

### Modified Capabilities

- `dashboard`: los KPIs "Ventas del mes" y "Ventas del día" (renombrado) pasan
  de placeholders "Sin información" a mostrar los totales reales de ventas por
  periodo; el KPI "Stock bajo mínimo" se renombra a "Artículos stock bajo"; y
  la sección "Ventas recientes" lista las 5 ventas más recientes en vez del
  estado vacío.

## Impact

- `src/pages/DashboardPage.tsx`: KPIs, sección de ventas recientes y manejo de
  datos de ventas.
- `src/services/ventas.service.ts`: nuevo servicio para el resumen de ventas
  por periodo (`/ventas/estadisticas`); el listado de ventas ya existe.
- `src/hooks/`: nuevo hook (p. ej. `useResumenVentas`) para consumir el
  resumen y las ventas recientes con TanStack Query.
- `src/types/domain.ts`: tipo para el resumen de ventas (`PeriodoVentas`,
  `ResumenVentasOut`).
- Backend (FastAPI): sin cambios; los endpoints `/api/v1/ventas/estadisticas`,
  `/api/v1/ventas` y `/api/v1/inventarios/bajo-minimo` ya están disponibles.
- Sin dependencias nuevas; usa `http`, TanStack Query, MUI/componentes UI
  existentes.