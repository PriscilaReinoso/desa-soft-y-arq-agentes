## 1. Tipos y servicios

- [x] 1.1 En `src/types/domain.ts`: agregar los tipos `MetodoPago` (`id`, `nombre`, `descripcion`), `VentaOut`, `VentaDetalleOut` (reutilizando `Articulo` y `Medida`), `ItemVentaPayload` y `VentaCreatePayload`, sin tocar el tipo mock `Venta`
- [x] 1.2 Crear `src/services/ventas.service.ts` con `createVenta(payload: VentaCreatePayload)` que envía `POST /ventas` (patrón de `inventario.service.ts`)
- [x] 1.3 Crear `src/services/metodosPago.service.ts` con `listMetodosPago()` que obtiene `GET /metodos-pago`

## 2. Hooks

- [x] 2.1 Crear `src/hooks/useVentas.ts` con `useCrearVenta()` que invalide `['inventarios']` y `['inventarios','bajo-minimo']` tras el éxito
- [x] 2.2 Crear `src/hooks/useMetodosPago.ts` con `useMetodosPago(options?: { enabled?: boolean })` (patrón de `useMedidas`)

## 3. Vista

- [x] 3.1 En `src/pages/InventoryPage.tsx`: habilitar el botón de carrito (quitar `disabled` y el título "Disponibilidad futura") y hacer que abra un modal de alta de venta para ese artículo (estado `ventaArticulo`)
- [x] 3.2 Agregar el modal de alta de venta con `react-hook-form`: cantidad vendida obligatoria (mayor a 0), nombre de cliente opcional, tipo de pago con `SearchableSelect` cargado desde `useMetodosPago` y check "Venta aprobada" activo por defecto
- [x] 3.3 Enviar `POST /api/v1/ventas` con `items` (`inventario_id`, `cantidad`, `metodo_pago_id` o `null`), `aprobado` según el check, `cliente` o `null` si está vacío y `presupuesto_id: null`; mostrar el error de la API dentro del modal sin cerrarlo y cerrarlo al éxito
- [x] 3.4 Ejecutar `npm run build` y confirmar que compila sin errores
