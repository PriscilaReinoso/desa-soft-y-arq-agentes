## 1. Tipos, servicio y helper http

- [x] 1.1 En `src/types/domain.ts`: reemplazar los tipos mock `ListaPrecios` y `Producto` por `ListaPrecioOut` (`id`, `articulo`, `medida`, `proveedor`, `id_articulo_proveedor`, `precio_lista`) y agregar los payloads `ItemListaPrecioPayload`, `ListaPreciosAltaPayload`, `ListaPreciosUpdatePayload` y `MapeoColumna`, reutilizando `ArticuloAltaPayload`, `MedidaAltaPayload` y `ProveedorCreatePayload`
- [x] 1.2 En `src/data/mock.ts`: eliminar los mocks `listasPrecios` y `priceListSample` (quedan sin uso)
- [x] 1.3 En `src/services/http.ts`: omitir el header `Content-Type: application/json` cuando el body es `FormData` (para la subida de Excel)
- [x] 1.4 Crear `src/services/listasPrecios.service.ts` con `listListasPrecios` (filtros `proveedor_id`, `categoria_ids` y `articulos` repetibles + `skip`/`limit`), `createListaPrecios`, `createListaPreciosExcel` (FormData con archivo, mapeo y proveedor), `updateListaPrecios` y `deleteListaPrecios` (patrón de `proveedores.service.ts`)

## 2. Hook

- [x] 2.1 Crear `src/hooks/useListasPrecios.ts` con `useListasPrecios(filtros)` (query key `['listas-precios', { proveedor_id, categoria_ids }]`), `useCrearListaPrecios`, `useCrearListaPreciosExcel`, `useActualizarListaPrecio` y `useEliminarListaPrecio`, invalidando `['listas-precios']` tras cada mutation

## 3. Vista

- [x] 3.1 En `src/pages/PriceListsPage.tsx`: reemplazar los mocks por `useListasPrecios()` con estados de loading y error (estilo `DepositsPage`) y agrupar los ítems por proveedor para las tarjetas seleccionables (nombre del proveedor + cantidad de artículos)
- [x] 3.2 Mostrar el detalle del proveedor seleccionado con una tabla de Artículo, Medida y Precio de lista, y el estado vacío "Seleccioná un proveedor para ver el detalle"
- [x] 3.3 Agregar filtros por proveedor (desde `useProveedores`) y por categorías (checkboxes desde `useCategorias`, query params repetidos) y un buscador que filtre por artículo en cliente
- [x] 3.4 Agregar modal de alta manual con `react-hook-form` (toggle proveedor existente/nuevo y ítems dinámicos con artículo, medida, precio de lista e `id_articulo_proveedor` opcional) que envíe `POST /listas-precios`
- [x] 3.5 Agregar modal de carga por Excel (selector de proveedor existente/nuevo, `input type="file"` y editor de mapeo de columnas) que envíe `POST /listas-precios/excel`
- [x] 3.6 Agregar edición de ítem (modal con precio de lista e `id_articulo_proveedor`, `PUT`) y baja con confirmación (`DELETE`); mostrar "+ Nueva lista", "Cargar Excel", "Editar" y "Eliminar" solo para rol ADMIN y errores de API en listado y modales
- [x] 3.7 Ejecutar `npm run build` y confirmar que compila sin errores

## 4. Refinamientos de UX (iteración posterior a prueba manual)

- [x] 4.1 Agregar dependencia `xlsx` y utilitario `src/lib/excelHeaders.ts` para leer los encabezados de la primera fila de un archivo Excel en el navegador
- [x] 4.2 En el modal de alta manual (`PriceListsPage.tsx`): por ítem, pills "Existente | Nuevo" para artículo y medida; modo nuevo artículo (nombre + categoría + descripción opcional) y nueva medida (unidad + medida); payload sin `id` para los nuevos e invalidación de queries de artículos/medidas tras guardar
- [x] 4.3 En el modal de alta manual: ítems colapsables con resumen (artículo · medida · precio) y acciones editar/eliminar; un solo ítem expandido a la vez; "+ Agregar ítem" agrega y expande
- [x] 4.4 En el modal de Excel: reemplazar el input nativo por dropzone clicable (ícono "+", texto de ayuda, nombre/tamaño del archivo elegido y acción para quitarlo)
- [x] 4.5 En el modal de Excel: al cargar archivo detectar encabezados, mostrar columnas detectadas (letra + encabezado) y mapear cada campo con un select de esas opciones; botón "Auto-mapear" con coincidencias típicas; sección deshabilitada sin archivo
- [x] 4.6 En el modal de Excel: validación previa al envío (archivo presente, mapeo no vacío, combinaciones requeridas: nombre o articulo_id; medida_id o unidad+medida; precio_lista; columnas existentes y sin duplicar) mostrando el detalle en el Alert sin llamar a la API
- [x] 4.7 En el modal de Excel: soportar la clave `articulo_medida_combinado` (columna única con artículo + unidad + medida) en `MAPEO_KEYS`, auto-mapeo y validación previa (satisface artículo y medida; incompatible con `articulo_id`, `nombre`, `unidad_medida`, `medida` y `medida_id`), alineado con el backend
- [x] 4.8 Escalar la carga: tarjetas de proveedores desde `GET /listas-precios/cantidad-por-proveedor` (`getCantidadListasPorProveedor` en el servicio, `useCantidadListasPorProveedor` con query key `['listas-precios','cantidad-por-proveedor']`) y detalle de ítems por proveedor seleccionado vía `useListasPrecios({ proveedor_id }, { enabled })`; total del encabezado como suma de cantidades; estados de carga/error propios para tarjetas y detalle; invalidaciones existentes de `['listas-precios']` cubren ambas queries
- [ ] 4.9 Ejecutar `npm run build`, verificar TypeScript sin errores y probar manualmente los flujos contra el backend local (alta manual con artículo nuevo, acordeón, Excel con mapeo por letra y caso que antes daba 400)
  - Build y TypeScript OK. Falta la prueba manual con sesión iniciada (requiere credenciales del usuario).
