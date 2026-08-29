## Why

La vista de listas de precios usa datos mock (`listasPrecios` y `priceListSample` de `src/data/mock.ts`) agrupados por tipo de cliente y con multiplicador, mientras el backend ya expone las listas de precios vía API (`/api/v1/listas-precios`). `docs/spec.md` exige que la vista consuma la API, agrupe por proveedor y permita alta manual o por Excel, con filtros por proveedor, categorías y artículo.

## What Changes

- La vista de listas de precios pasa a consumir `GET /api/v1/listas-precios` (JWT) en lugar de los mocks `listasPrecios` y `priceListSample`.
- La agrupación deja de ser por cliente (mock) y pasa a ser por proveedor: cada tarjeta representa un proveedor con la cantidad de artículos de su lista.
- Al seleccionar un proveedor se muestra una tabla con Artículo, Medida y Precio de lista de sus ítems.
- Alta manual vía `POST /api/v1/listas-precios` desde un formulario con proveedor (existente o nuevo) e ítems (artículo, medida, precio de lista e `id_articulo_proveedor` opcional); y alta por Excel vía `POST /api/v1/listas-precios/excel` con selección previa del proveedor. Cada caso tiene su botón, visibles solo para rol ADMIN.
- Edición del precio de un ítem vía `PUT /api/v1/listas-precios/{id}` y baja vía `DELETE /api/v1/listas-precios/{id}` con confirmación, para rol ADMIN.
- Filtros: por proveedor, por categorías (query params de la API) y un buscador que filtra por artículo en cliente.
- Refinamientos de UX tras prueba manual (frontend-only, sin cambios de backend):
  - Alta manual: cada ítem permite elegir un artículo/medida existente o dar de alta uno nuevo inline (artículo: nombre + categoría + descripción opcional; medida: unidad + medida), aprovechando que el backend ya crea artículos/medidas sin `id`.
  - Alta manual: los ítems cargados se muestran como filas colapsadas con resumen (artículo · medida · precio) y solo uno permanece expandido para edición a la vez (comportamiento acordeón).
  - Alta por Excel: el input nativo de archivo se reemplaza por una zona de carga visible (dropzone clicable con ícono "+" y nombre del archivo seleccionado).
  - Alta por Excel: al seleccionar el archivo se detectan sus encabezados (vía `xlsx` en el navegador) y el mapeo pasa a ser un selector por columna detectada, mostrando la letra de columna (A, B, C…) junto al encabezado real; incluye auto-mapeo sugerido. Se envían los nombres reales de encabezado, por lo que no cambian las llamadas al backend.
  - Alta por Excel: validación previa en cliente de las combinaciones requeridas por el backend (nombre o articulo_id; medida_id o unidad_medida + medida; precio_lista obligatorio) para evitar errores 400 evitables.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `listas-precios`: la vista pasa de datos mock a datos de la API; se reemplaza el selector de listas por cliente (con multiplicador) por una agrupación por proveedor con detalle de ítems (artículo, medida, precio de lista) y se agregan los requisitos de alta manual, alta por Excel, edición de precio, baja y filtros por proveedor, categorías y artículo.

## Impact

- `src/types/domain.ts`: se reemplaza el tipo `ListaPrecios` mock por el shape de la API (`ListaPrecioOut`: `id`, `articulo`, `medida`, `proveedor`, `id_articulo_proveedor`, `precio_lista`) y se agregan los payloads de alta manual, excel y edición.
- Nuevo `src/services/listasPrecios.service.ts`: `listListasPrecios` (filtros `proveedor_id`, `categoria_ids`, `articulos`), `createListaPrecios`, `createListaPreciosExcel`, `updateListaPrecios`, `deleteListaPrecios`.
- Nuevo `src/hooks/useListasPrecios.ts`: query y mutations con invalidación de `['listas-precios']`.
- `src/pages/PriceListsPage.tsx`: consume el hook, agrupa por proveedor, agrega detalle de ítems, filtros, modal de alta manual (con alta inline de artículo/medida nueva e ítems colapsables), modal de carga por Excel (dropzone, detección de encabezados y mapeo por columna con auto-mapeo y validación previa), edición de precio y baja con confirmación.
- Nueva dependencia `xlsx` (SheetJS) para leer únicamente la fila de encabezados del Excel en el navegador.
- Sin cambios en el backend.
