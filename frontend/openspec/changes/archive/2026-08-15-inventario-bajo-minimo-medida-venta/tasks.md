## 1. Tipos de dominio

- [x] 1.1 Agregar en `src/types/domain.ts` los campos `minimo_stock: number` y `medida_venta: Medida | null` a `InventarioOut`
- [x] 1.2 Agregar en `src/types/domain.ts` a `InventarioRow` los campos `minimo_stock: number`, `medida_venta: string | null` y `bajo_minimo: boolean`
- [x] 1.3 Agregar en `src/types/domain.ts` a `InventarioAltaPayload` los campos opcionales `minimo_stock` y `medida_venta_id`

## 2. Capa de servicios

- [x] 2.1 Agregar en `src/services/inventario.service.ts` `getInventariosBajoMinimo(params?)` que haga `GET /inventarios/bajo-minimo` y devuelva `InventarioOut[]`
- [x] 2.2 Ampliar el tipo de `updateInventario` para aceptar `minimo_stock?: number` y `medida_venta_id?: string | null`

## 3. Hooks

- [x] 3.1 Agregar en `src/hooks/useInventarios.ts` el hook `useInventariosBajoMinimo` (useQuery con queryKey `['inventarios', 'bajo-minimo']`)
- [x] 3.2 Hacer que `useAltaInventario`, `useActualizarInventario` y `useEliminarInventario` invaliden también la query `['inventarios', 'bajo-minimo']`

## 4. Dashboard

- [x] 4.1 En `src/pages/DashboardPage.tsx` alimentar el KPI "Stock bajo mínimo" con el conteo de `useInventariosBajoMinimo` (formateado con `toLocaleString`); ante error mostrar `—` con variación "Sin información"
- [x] 4.2 Renderizar en el bloque "Stock bajo mínimo" la lista real de ítems bajo mínimo (nombre, stock/unidad de `minimo`, porcentaje y `ProgressBar` coloreada por umbral); ante error o lista vacía mostrar "Sin información"
- [x] 4.3 Mantener en el bloque los enlaces "Ver →" (a inventario) y el botón del Asistente IA

## 5. Página de inventario

- [x] 5.1 En `src/pages/InventoryPage.tsx` mapear `minimo_stock`, `medida_venta` (texto compuesto) y `bajo_minimo` al construir `InventarioRow`
- [x] 5.2 Agregar a la tabla la columna "Mínimo" (mono) y mostrar la insignia "Bajo stock" con el stock en color de alerta cuando `bajo_minimo`
- [x] 5.3 Mostrar el precio de venta con sufijo `/ {medida_venta}` cuando el ítem tenga medida de venta
- [x] 5.4 Agregar al formulario de alta los campos "Stock mínimo" (número ≥ 0) y "Medida de venta" (Select opcional de `useMedidas`) y enviarlos como `minimo_stock` y `medida_venta_id` en el payload
- [x] 5.5 Agregar al modal de edición los campos "Stock mínimo" y "Medida de venta" precargados y enviarlos en `updateInventario`

## 6. Verificación

- [x] 6.1 Ejecutar `npm run build` sin errores de TypeScript
- [ ] 6.2 Revisar visualmente en `npm run dev` contra el backend (dashboard con bajo mínimo real y tabla de inventario con mínimo, insignia y sufijo de precio)
