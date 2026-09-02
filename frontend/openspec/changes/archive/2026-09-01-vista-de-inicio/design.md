## Context

La vista de inicio (`src/pages/DashboardPage.tsx`) hoy construye los KPIs en
línea y usa solo datos de inventario (resumen, listado y bajo mínimo); los KPIs
de ventas muestran placeholders "Sin información" y la sección "Ventas
recientes" un estado vacío, porque asumía que el backend no exponía ventas. La
motivación está en `proposal.md`. El backend ya expone:

- `GET /api/v1/ventas/estadisticas?periodo=mes|dia|semana|anio` →
  `ResumenVentasOut` (`total` como string decimal, `cantidad_ventas`).
- `GET /api/v1/ventas` → listado de ventas (`VentaCabeceraOut[]` con `fecha`,
  `total`, `cantidad`, `detalles[].articulo`).

El frontend ya tiene `listVentas()` y el tipo `VentaOut`; el cliente HTTP
antepone `/api/v1` (`src/services/http.ts`). Los KPIs actuales muestran
"Órdenes pendientes" y "Stock bajo mínimo"; el issue pide renombrarlos a
"Ventas del día" y "Artículos stock bajo" respectivamente.

## Goals / Non-Goals

**Goals:**
- Conectar los KPIs "Ventas del mes" y "Ventas del día" a los totales reales
  del resumen de ventas por periodo, con fallback controlado a "Sin
  información" cuando el dato no esté disponible.
- Listar las 5 ventas más recientes (fecha, artículo, cantidad, total) en la
  sección "Ventas recientes", manteniendo el enlace "Ver todas".
- Renombrar los indicadores según lo pedido ("Ventas del día", "Artículos
  stock bajo") sin cambiar su comportamiento de datos.
- Mantener la arquitectura existente (servicios + hooks de TanStack Query +
  componentes UI actuales).

**Non-Goals:**
- No modificar el backend ni agregar endpoints nuevos.
- No cambiar la sección de bajo stock (lista con "Ver"), el encabezado de
  bienvenida ni el acceso al asistente.
- No agregar paginación, filtros ni gráficos al panel de ventas recientes.

## Decisions

1. **KPIs de ventas desde el resumen por periodo, no por agregación client-side.**
   Agregar `getResumenVentas(periodo)` en `src/services/ventas.service.ts` que
   llama a `GET /ventas/estadisticas?periodo=<p>` y un hook
   `useResumenVentas(periodo)` (query key `['ventas','resumen', periodo]`).
   "Ventas del mes" → `periodo: 'mes'`; "Ventas del día" → `periodo: 'dia'`.
   Alternativa descartada: sumar los `total` de `listVentas()` filtrando por
   fecha, porque duplica la lógica de negocio y no coincide con el resumen del
   backend.
2. **Ventas recientes desde `listVentas()` reutilizado.**
   Usar el hook/query de ventas existente; en el cliente quedarse con las 5
   más recientes por `fecha` (desc). Fila: fecha formateada (locale `es-AR`),
   artículo principal = nombre del primer `detalle.articulo` (si hay varios,
   "nombre +N"), cantidad y total en moneda con `formatCurrency`.
   Alternativa: exponer un endpoint específico de "recientes"; se descarta por
   no agregar backends y porque con 100 registros el filtro cliente alcanza.
3. **Renombrado solo de etiquetas.**
   Cambiar `label` de los KPIs a "Ventas del día" y "Artículos stock bajo";
   el dato de "Artículos stock bajo" sigue viniendo de
   `useInventariosBajoMinimo`. Los íconos/colores se conservan.
4. **Fallback por KPI sin bloquear la página.**
   El dashboard hoy bloquea el render hasta que resuelven los queries de
   inventario; los queries de ventas se suman de forma independiente:
   mientras no resuelven, el KPI muestra el formato de carga ("—" / "Cargando…")
   y ante error muestra "Sin información", igual que el patrón de
   `bajoMinimoUnavailable`. La sección "Ventas recientes" muestra el estado
   vacío "Sin información disponible" si no hay ventas o el query falla.

## Risks / Trade-offs

- `total` y `sub_total` llegan como string decimal del backend → Mitigación:
  convertir con `Number()` para formatear en moneda (`formatCurrency`),
  cuidando el manejo de valores no numéricos.
- `GET /ventas` puede devolver listas sin orden garantizado → Mitigación:
  ordenar por `fecha` descendente en el cliente antes de tomar las 5.
- Ventas recientes limitadas a las primeras 100 del listado → Mitigación:
  aceptable para una vista de "recientes"; si el volumen crece, un endpoint
  dedicado lo resolvería (fuera de alcance).
- Si las estadísticas cuestan caro a nivel BD → Mitigación: visible solo en el
  dashboard; el backend ya lo expone como endpoint dedicado.

## Migration Plan

Cambio solo de frontend: ninguna migración de datos. Rollback: revertir
`DashboardPage.tsx`, el servicio/hook y los tipos; los endpoints del backend
permanecen intactos.

## Open Questions

- Si las estadísticas/ventas recientes deben incluir o excluir ventas no
  aprobadas (`aprobado: false`) lo define el backend; el frontend muestra lo
  que devuelven `/ventas/estadisticas` y `/ventas`. Se puede ajustar en
  implementación sin cambiar las specs.