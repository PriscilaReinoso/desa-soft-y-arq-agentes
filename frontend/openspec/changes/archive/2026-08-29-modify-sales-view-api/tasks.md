## 1. Tipos y datos

- [x] 1.1 Alinear en `src/types/domain.ts` el tipo de venta al contrato real (`VentaOut` con `numero`, `fecha`, `cliente: string | null`, `aprobado`, `total: string`, `detalles`) y eliminar el tipo mock `Venta`/`VentaStatus`
- [x] 1.2 Eliminar de `src/data/mock.ts` las exportaciones `ventas`, `salesStatuses` y `statusColor`

## 2. Servicio y hooks

- [x] 2.1 Agregar `listVentas()` en `src/services/ventas.service.ts` (`GET /ventas?skip=0&limit=100`)
- [x] 2.2 Agregar hook `useVentas()` (queryKey `['ventas']`) en `src/hooks/useVentas.ts`
- [x] 2.3 Hacer que `useCrearVenta` invalide también `['ventas']`

## 3. Vista de ventas

- [x] 3.1 Reescribir `SalesPage.tsx` para consumir `useVentas()`: estados de carga, error (`Alert`) y vacío (`EmptyState`)
- [x] 3.2 Adaptar columnas a la API: número, fecha, cliente (guion si es null), cantidad, total (`Number(total)` + `formatCurrency`), insignia Aprobada/Pendiente y acciones
- [x] 3.3 Reemplazar píldoras por "Todas / Aprobadas / Pendientes" con total del encabezado recalculado sobre lo filtrado

## 4. Detalle de venta

- [x] 4.1 Agregar modal "Ver" con cabecera (fecha, cliente, estado, total) y tabla de ítems (artículo, medida, cantidad, precio unitario, subtotal, método de pago) usando los `detalles` de la fila

## 5. Alta de venta

- [x] 5.1 Agregar modal "+ Nueva venta" con selector de artículo sobre `useInventarios()` filtrando `stock > 0` (muestra stock disponible) y cantidad validada `> 0 && <= stock`
- [x] 5.2 Completar el formulario con cliente opcional, método de pago (`useMetodosPago({ enabled })`) y check "Venta aprobada" (default true); enviar `POST /ventas` con `presupuesto_id: null` y mostrar errores de la API en el modal sin cerrarlo

## 6. Verificación

- [ ] 6.1 Ejecutar `npm run build` (o `tsc --noEmit` + lint) y verificar la vista contra el backend en `http://127.0.0.1:8000`: listado, filtros, detalle, alta válida, alta con cantidad mayor al stock (mensaje) y venta sin stock (error de la API)

> Nota: `npm run build` (tsc + vite) pasa y el backend responde en `http://127.0.0.1:8000` con `GET /ventas` protegido por JWT (401 sin token). Falta la verificación visual interactiva en el navegador (requiere sesión).

## 7. Gestión de pendientes y alta multi-artículo

- [x] 7.1 Agregar `updateVenta()` (`PUT /ventas/{id}`) y `deleteVenta()` (`DELETE /ventas/{id}`) en `src/services/ventas.service.ts`
- [x] 7.2 Agregar hooks `useActualizarVenta()` y `useEliminarVenta()` en `src/hooks/useVentas.ts` (invalidan `['ventas']` e `['inventarios']`)
- [x] 7.3 Convertir el modal "+ Nueva venta" a multi-artículo: filas dinámicas artículo + cantidad (agregar/quitar, mínimo 1), validación de stock por fila y un único tipo de pago aplicado a todos los ítems
- [x] 7.4 Agregar acciones "Aprobar", "Agregar ítems" y "Cancelar" en filas Pendiente: modal de agregar ítems (existentes solo lectura + nuevos; PUT con set completo preservando metodo_pago_id de existentes), aprobar con PUT `aprobado: true`, cancelar con confirmación + DELETE; errores visibles sin perder estado
- [ ] 7.5 Ejecutar `npm run build` y verificar contra el backend: alta multi-artículo, agregar ítems a pendiente (total recalculado), aprobar, cancelar (desaparece del listado), cantidad > stock (mensaje) y errores de la API

> Nota 7.5: `npm run build` pasa; falta la verificación visual interactiva en navegador (requiere sesión).

## 8. Ajuste de UX: estado desplegable y editor de ventas

- [x] 8.1 Reemplazar la insignia de estado por un desplegable editable (Pendiente/Aprobada) en la columna Estado de todas las filas; el cambio dispara `PUT { aprobado }` y se elimina el botón "Aprobar"
- [x] 8.2 Reemplazar "+ Ítems" por "Editar" en todas las filas: modal editor con los ítems existentes como filas editables (cambiar artículo, modificar cantidad, quitar), agregado de nuevos, tipo de pago único precargado con el método del primer ítem y cliente editable; PUT con el set completo
- [x] 8.3 Ajustar la validación de stock en edición para considerar el stock restaurado de los ítems actuales (stock actual + cantidad original por artículo)
- [ ] 8.4 Ejecutar `npm run build` y verificar: cambio de estado desde el desplegable (ambos sentidos), edición de cantidades/quitar/agregar con total recalculado, cancelar sigue solo en pendientes y errores visibles

> Nota 8.4: `npm run build` pasa; falta la verificación visual interactiva en navegador (requiere sesión).
