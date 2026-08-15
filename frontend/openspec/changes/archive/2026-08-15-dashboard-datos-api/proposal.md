## Why

El dashboard (vista de inicio) muestra datos mock y una fecha hardcodeada, mientras que el backend ya expone el inventario real. El caso de uso requiere que la vista de inicio muestre información real obtenida de la API; como la API aún no tiene métodos de ventas ni stock mínimo, esos bloques deben mostrarse sin información en lugar de inventar datos.

## What Changes

- Reemplazar los KPIs mock por valores reales: el KPI "Artículos en stock" mostrará la cantidad real calculada por el backend (endpoint de resumen). Mientras ese endpoint no esté disponible, el sistema calculará en el cliente la cantidad de artículos distintos a partir de `GET /api/v1/inventarios` como fallback.
- Los KPIs "Ventas del mes" y "Órdenes pendientes" y el bloque "Stock bajo mínimo" mostrarán un placeholder "Sin información" (la API no expone esos datos todavía).
- La tabla "Ventas recientes" mostrará un estado vacío "Sin información disponible" en lugar de filas mock.
- El encabezado mostrará la fecha real del día (dinámica) en lugar de una fecha hardcodeada; el saludo continúa usando el nombre real del usuario autenticado.
- Se agregan estados de carga y de error para la consulta al inventario (el 401 ya redirige al login por `http.ts`).

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `dashboard`: los requisitos de indicadores clave, ventas recientes y stock bajo mínimo cambian para alimentarse de datos reales de la API (o mostrar "sin información" cuando el backend no provee el dato).

## Impact

- `src/pages/DashboardPage.tsx`: reescritura de la página para usar datos reales.
- `src/services/inventario.service.ts`: agregar `getInventarioResumen()` que llama al endpoint de cálculo del backend.
- `src/hooks/useInventarios.ts`: hook `useInventarioResumen` (con fallback al conteo local de artículos distintos desde `useInventarios`).
- `src/data/mock.ts`: se dejan de usar `kpis`, `recentSales` y `lowStock` en el dashboard (los datos mock no se eliminan porque otras páginas pueden usarlos).
- Backend: se requiere (en un change del backend) un endpoint de resumen que devuelva el total de artículos en stock; mientras no exista, el frontend usa el fallback local.
