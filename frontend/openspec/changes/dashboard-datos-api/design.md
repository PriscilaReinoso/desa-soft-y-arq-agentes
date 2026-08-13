## Context

`DashboardPage.tsx` se compone de datos mock (`kpis`, `recentSales`, `lowStock` de `src/data/mock.ts`) y una fecha hardcodeada. El backend (FastAPI en `http://127.0.0.1:8000`) expone `GET /api/v1/inventarios` (con `articulo`, `categoria`, `medida`, `espacio` embebidos) pero NO tiene métodos de ventas, órdenes ni stock mínimo. El frontend ya cuenta con el hook `useInventarios` (`['inventarios']`) y con la infraestructura de `KpiCard`, `Badge`, `ProgressBar`, `Card`, `EmptyState` y `Alert`. Ver proposal.md - Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Alimentar el dashboard con datos reales donde el backend los provee (artículos en stock).
- Presentar de forma consistente los bloques sin respaldo de API con placeholder "Sin información".
- Mostrar la fecha real del día en el encabezado.

**Non-Goals:**
- No agregar endpoints al backend (ventas, órdenes, stock mínimo). Eso queda fuera de este change.
- No eliminar los datos mock de `src/data/mock.ts` (los usan otras páginas como ventas, proveedores, presupuestos).

## Decisions

- **KPI "Artículos en stock" con cálculo del backend y fallback local**: se agrega `getInventarioResumen()` en `src/services/inventario.service.ts` que llama al endpoint de cálculo del backend (p.ej. `GET /api/v1/inventarios/resumen`) y un hook `useInventarioResumen`. Si el endpoint no está disponible (aún no implementado en el backend) o falla, la página cae al fallback: contar artículos distintos (`new Set(items.map(i => i.articulo.id)).size`) sobre `useInventarios` (query `['inventarios']`). Se prefiere delegar el cálculo al backend para no depender del tamaño del listado; el fallback evita bloquear el dashboard mientras el endpoint no exista.
  - Alternativa considerada: calcular siempre en el cliente — descartada por pedido del usuario; el backend debe proveer el cálculo.
  - Nota: el endpoint de resumen del backend se implementa en un change del backend; este change solo lo consume, con fallback.
- **KPIs y bloques sin dato → placeholder uniforme**: se renderizan las 4 tarjetas KPI y los dos bloques laterales con el mismo layout actual, pero los que no tienen respaldo muestran valor `—` y variación "Sin información" (o un estado vacío para la tabla de ventas). Se prefirió mantener el layout antes que ocultar bloques, según decisión del usuario.
- **Fecha dinámica**: se genera con `new Date()` formateada en español (`toLocaleDateString('es-AR', {...})`). La bienvenida sigue tomando `usuario.nombre` de `useAuth()`.
- **Estados de carga y error**: mientras `useInventarios` está pendiente se muestra el loading existente; ante error se muestra `Alert` con el detalle del `ApiError` (el 401 ya redirige a login por `http.ts`).
- **Botones de navegación intactos**: "Ver todas" (→ ventas), "Ver" (→ inventario) y "Consultar al Asistente IA" (→ asistente) se conservan aunque el contenido de sus bloques sea placeholder.

## Risks / Trade-offs

- [El fallback de cálculo local depende del listado completo] → La consulta `GET /inventarios` usa los defaults del backend (skip 0, limit 100); con el endpoint de resumen del backend el cálculo es exacto. Si el dataset crece antes de existir el endpoint, el fallback puede subestimar el total.
- [El placeholder "Sin información" puede confundir vs. un dato real] → La variación explicita "dato no disponible" y el layout es idéntico al resto, evitando ambigüedad.
