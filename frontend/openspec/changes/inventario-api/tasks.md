## 1. Tipos de dominio

- [x] 1.1 Agregar en `src/types/domain.ts` el tipo `InventarioAltaPayload` (payload anidado: `articulo`, `medida`, `espacio` opcional, `fila`, `columna`, `stock`, `precio_venta`)
- [x] 1.2 Agregar en `src/types/domain.ts` el tipo `InventarioRow` (fila de la tabla con nombres resueltos: categoría, artículo, medida compuesta, depósito, espacio, fila, columna, stock, precio_venta)

## 2. Capa de servicios

- [x] 2.1 Reemplazar `createInventario` en `src/services/inventario.service.ts` por `altaInventario(payload: InventarioAltaPayload)` que haga `POST /inventarios/alta`
- [x] 2.2 Ajustar el tipo de retorno de `listInventarios` al `InventarioOut` embebido (articulo con categoria, medida, espacio con deposito) y conservar el endpoint `GET /inventarios`
- [x] 2.3 Verificar que los services de maestros (`articulos`, `categorias`, `medidas`, `depositos`, `espacios`) apunten a los endpoints reales con sus tipos de dominio

## 3. Hooks

- [x] 3.1 Agregar en `src/hooks/useInventarios.ts` el hook `useAltaInventario` (useMutation) que llame `altaInventario` e invalide la query `['inventarios']` al completar
- [x] 3.2 Verificar los hooks de maestros (`useArticulos`, `useCategorias`, `useMedidas`, `useDepositos`, `useEspacios`) y sus query keys para composición en la página

## 4. Página de inventario

- [x] 4.1 Reescribir `src/pages/InventoryPage.tsx` para cargar el inventario desde la API y mapear la respuesta embebida (`articulo`/`categoria`, `medida`, `espacio`/`deposito`) a `InventarioRow`
- [x] 4.2 Renderizar la tabla con las columnas Categoría, Artículo, Medida, Stock, Ubicación (depósito, espacio, fila, columna) y P. Venta, incluyendo medida compuesta y el caso "sin ubicación asignada"
- [x] 4.3 Mostrar estado de carga mientras las queries estén pendientes y un mensaje de error si fallan (el 401 ya lo maneja `http.ts`)
- [x] 4.4 Implementar la búsqueda por nombre o categoría y los filtros de categoría como píldoras sobre los datos cargados
- [x] 4.5 Reescribir el formulario "+ Nuevo artículo": selectores de artículo/medida/espacio existentes o creación inline (nombre y categoría; unidad y medida; depósito), campos fila/columna/stock/precio_venta, envío por `altaInventario`, refresco del listado en el éxito y muestra del detalle del `ApiError` en el fallo

## 5. Verificación

- [x] 5.1 Ejecutar `npm run build` sin errores de TypeScript
- [ ] 5.2 Probar contra el backend en `http://127.0.0.1:8000`: carga del listado con nombres resueltos y alta de inventario (requiere rol ADMIN)
