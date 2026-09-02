## 1. Tipos y servicio de resumen de ventas

- [x] 1.1 Agregar a `src/types/domain.ts` los tipos `PeriodoVentas` (`dia | semana | mes | anio`) y `ResumenVentasOut` (`periodo`, `desde`, `hasta`, `total: string`, `cantidad_ventas: number`)
- [x] 1.2 Agregar en `src/services/ventas.service.ts` la función `getResumenVentas(periodo: PeriodoVentas)` que llama a `GET /ventas/estadisticas?periodo=<p>` vía `http`

## 2. Hooks de ventas para el dashboard

- [x] 2.1 Crear `src/hooks/useVentas.ts` (o archivo afín) el hook `useResumenVentas(periodo)` con TanStack Query (query key `['ventas','resumen', periodo]`)
- [x] 2.2 Verificar que `useVentas`/`listVentas` esté disponible para consumir el listado de ventas recientes desde el dashboard

## 3. Vista de inicio (DashboardPage)

- [x] 3.1 Renombrar los KPIs: "Órdenes pendientes" → "Ventas del día" y "Stock bajo mínimo" → "Artículos stock bajo" (sin cambiar íconos/colores ni datos de bajo stock)
- [x] 3.2 Conectar el KPI "Ventas del mes" al resumen con `periodo: 'mes'`: muestra `formatCurrency(Number(total))` y, ante error/indisponibilidad, "Sin información" sin romper el resto de los KPIs
- [x] 3.3 Conectar el KPI "Ventas del día" al resumen con `periodo: 'dia'` (mismo manejo de fallback que 3.2)
- [x] 3.4 Reemplazar el estado vacío de "Ventas recientes" por las 5 ventas más recientes de `listVentas()` ordenadas por `fecha` desc, mostrando por fila: fecha (`es-AR`), artículo principal (primer `detalle.articulo.nombre`, o "nombre +N" si hay más), cantidad y total en moneda; mantener el enlace "Ver todas"
- [x] 3.5 Mantener el estado vacío "Sin información disponible" en "Ventas recientes" cuando no hay ventas o el listado falla, y el loading propio mientras resuelve

## 4. Verificación

- [x] 4.1 Ejecutar typecheck y lint del frontend y corregir errores
- [x] 4.2 Probar la vista con backend levantado (KPIs con totales reales de día/mes y ventas recientes) y, si se puede, con backend caído para validar los fallbacks "Sin información"