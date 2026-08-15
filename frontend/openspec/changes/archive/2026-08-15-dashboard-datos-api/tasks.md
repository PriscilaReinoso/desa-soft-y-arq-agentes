## 1. Datos desde la API

- [x] 1.1 Agregar `getInventarioResumen()` en `src/services/inventario.service.ts` (llama al endpoint de cálculo del backend) y el hook `useInventarioResumen` en `src/hooks/useInventarios.ts`
- [x] 1.2 Reescribir `src/pages/DashboardPage.tsx` para el KPI "Artículos en stock": usar el cálculo del backend y, si no está disponible, caer al conteo local de artículos distintos (`new Set(rows.map(r => r.articulo.id)).size`) sobre `useInventarios`, formateado con `toLocaleString`
- [x] 1.3 Mostrar estados de carga (mientras las queries están pendientes) y de error (con `Alert` y el detalle del `ApiError`) al consultar inventario o resumen

## 2. Bloques sin datos disponibles

- [x] 2.1 Renderizar los KPIs "Ventas del mes", "Órdenes pendientes" y "Stock bajo mínimo" con valor `—` y variación "Sin información" (manteniendo icono, color y etiqueta)
- [x] 2.2 Reemplazar la tabla "Ventas recientes" por un estado vacío "Sin información disponible" manteniendo el botón "Ver todas →"
- [x] 2.3 Reemplazar la lista "Stock bajo mínimo" por un placeholder "Sin información" manteniendo el botón "Ver →" y el acceso al asistente IA

## 3. Encabezado

- [x] 3.1 Mostrar la fecha del día actual con `new Date().toLocaleDateString('es-AR', ...)` en lugar de la fecha hardcodeada, conservando el saludo con `usuario.nombre`

## 4. Verificación

- [x] 4.1 Ejecutar `npm run build` sin errores de TypeScript
- [ ] 4.2 Revisar visualmente en `npm run dev` que el dashboard muestre el KPI real, los placeholders y la fecha dinámica
