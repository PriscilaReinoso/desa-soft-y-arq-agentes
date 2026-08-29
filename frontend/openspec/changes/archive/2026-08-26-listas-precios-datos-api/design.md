## Context

La vista actual (`PriceListsPage.tsx`) renderiza los mocks `listasPrecios` (listas por tipo de cliente con `multiplier`) y `priceListSample` (productos con `base`), sin operaciones de alta/edición/baja. El backend ya expone el CRUD en `/api/v1/listas-precios` (todos los endpoints requieren JWT; `POST`, `POST /excel`, `PUT` y `DELETE` requieren rol ADMIN). El shape es item-level: `{ id, articulo: ArticuloOut, medida: MedidaOut, proveedor: ProveedorOut, id_articulo_proveedor, precio_lista }`; no existe el concepto de "multiplicador" ni de lista por cliente. El `GET` acepta filtros `proveedor_id`, `categoria_ids` y `articulos` (repetibles) con `skip/limit`. El alta manual usa `ListaPreciosAlta` (`proveedor_id` **o** `proveedor` nuevo + `items[]` con `articulo`, `medida`, `precio_lista`); el alta por Excel usa `POST /listas-precios/excel` con archivo, `mapeo` (lista `{key, value}`) y proveedor. `docs/spec.md` exige agrupar por proveedor, ver artículos/medida/precio al seleccionar, alta manual y por Excel, y filtros por proveedor, categorías y buscador de artículo.

Ver proposal.md para la motivación y specs/listas-precios/spec.md para los requisitos de comportamiento.

## Goals / Non-Goals

**Goals:**
- Reemplazar el mock por datos de la API respetando el patrón service + hook + query/mutations existente (ver `proveedores.service.ts`/`useProveedores.ts`).
- Agrupación por proveedor con tarjetas seleccionables y detalle de ítems (artículo, medida, precio de lista).
- Alta manual (formulario) y alta por Excel (archivo + mapeo), edición de precio y baja con confirmación, gated por rol ADMIN.
- Filtros por proveedor, categorías (multi) y buscador de artículo.

**Non-Goals:**
- Paginación en el frontend (la API pagina con `skip/limit` por defecto; se listan los primeros 100).
- Búsqueda server-side por artículo (se filtra en cliente sobre el listado obtenido).
- "Exportar PDF" (no existe endpoint en la API de listas de precios).
- Cambios en el backend ni en `docs/spec.md` (incluye el soporte de letras de columna en el mapeo del backend: se resuelve en cliente enviando los encabezados reales).

## Decisions

- **Reutilizar tipos existentes**: `Articulo`, `Medida` y `Proveedor` ya existen en `domain.ts` y coinciden con `ArticuloOut`, `MedidaOut` y `ProveedorOut`. Se agrega `ListaPrecioOut` y los payloads; se reutilizan `ArticuloAltaPayload`, `MedidaAltaPayload` y `ProveedorCreatePayload` (coinciden con `ArticuloAlta`, `MedidaAlta` y `ProveedorAlta`). Los mocks `listasPrecios`, `priceListSample` y los tipos `ListaPrecios` y `Producto` quedan sin uso y se eliminan. *Alternativa descartada:* definir tipos duplicados — no aporta valor.
- **Agrupación por proveedor en cliente**: un único `GET /listas-precios` (con filtros) alimenta tarjetas por `proveedor.id` (nombre + cantidad de artículos); el detalle muestra los ítems de ese proveedor. *Alternativa descartada:* un `GET` por proveedor — multiplica requests sin justificación.
- **Filtros vía query de TanStack Query**: `proveedor_id` y `categoria_ids` (repetido por cada id) se pasan como query params; query key `['listas-precios', { proveedor_id, categoria_ids }]`. El buscador de artículo filtra en cliente sobre el listado resultante. Cada mutation invalida `['listas-precios']`.
- **Subida de Excel y Content-Type**: el helper `http` fija `Content-Type: application/json` en todos los requests; para `FormData` eso rompe el boundary multipart. Se modifica `http.ts` para omitir ese header cuando `options.body instanceof FormData` (el navegador lo setea solo). *Alternativa descartada:* fetch manual en el service — duplica manejo de token/errores.
- **Alta manual**: modal con toggle "Proveedor existente / Nuevo proveedor". Existente: `SearchableSelect` alimentado por `useProveedores`. Nuevo: campos nombre, apellido, teléfono (obligatorios) y dirección opcional. Ítems dinámicos (botón "+ Agregar ítem"): cada fila con `SearchableSelect` de artículo (`useArticulos`), `SearchableSelect` de medida (`useMedidas`), precio de lista (número) y `id_articulo_proveedor` opcional. Al guardar se envían `articulo.id`/`medida.id` (se reutilizan existentes) y al menos 1 ítem.
- **Alta por Excel**: modal con el mismo selector de proveedor (existente o nuevo), `<input type="file" accept=".xlsx">` y editor de mapeo: filas `key → header de columna` con defaults (`categoria`, `nombre`, `unidad_medida`, `medida`, `precio_lista`) editables; se envía `FormData` con `archivo`, `mapeo` (JSON) y `proveedor_id` (o `proveedor` JSON si es nuevo).
- **Edición/baja de ítem**: "Editar" abre un modal con `precio_lista` e `id_articulo_proveedor` (`PUT /listas-precios/{id}`); "Eliminar" pide confirmación con `window.confirm(...)` (`DELETE /listas-precios/{id}`).
- **Gating por rol**: `const isAdmin = usuario?.rol === 'ADMIN'`, igual que `DepositsPage`/`SuppliersPage`. Se ocultan los botones de alta/edición/baja para no-admin; el backend además responde 403.
- **Errores**: se muestran vía `ApiError.message` (400/403/404/409/422) en el listado y dentro de los modales, siguiendo el patrón de `DepositsPage`.

### Refinamientos de UX (iteración posterior a la primera implementación)

- **Alta inline de artículo/medida nueva**: cada ítem del alta manual agrega pills "Existente | Nuevo" para artículo y para medida (mismo patrón visual que Proveedor). Artículo nuevo: nombre + categoría (`SearchableSelect` desde `useCategorias`) + descripción opcional; medida nueva: unidad de medida + medida. El payload envía `{ nombre, categoria_id }` / `{ unidad_medida, medida }` sin `id`: `_resolve_articulo`/`_resolve_medida` del backend ya crean el recurso cuando falta el `id`. Tras un alta exitosa se invalidan también las queries de artículos y medidas. *Alternativa descartada:* obligar a crear el artículo en otra vista — rompe el flujo de carga de una lista.
- **Ítems colapsables (acordeón)**: estado `expandedItemIndex: number | null`; solo un ítem expandido a la vez. Fila colapsada: resumen "artículo · medida · precio" con botones editar (expande y colapsa el anterior) y eliminar. "+ Agregar ítem" agrega y expande el nuevo. La validación al guardar evalúa todos los ítems aunque estén colapsados. *Alternativa descartada:* acordeón multi-expansión — no resuelve el problema de legibilidad reportado.
- **Dropzone de archivo**: `<label>` clicable con borde punteado, ícono "+" y texto "Seleccionar archivo Excel (.xlsx)"; contiene el `<input type="file">` oculto. Tras elegir archivo muestra nombre y tamaño, con acción para quitarlo. *Alternativa descartada:* input nativo sin estilizar — poco visible según prueba manual.
- **Detección de encabezados y mapeo por letra**: nueva dependencia `xlsx` (SheetJS); al seleccionar el archivo se lee solo la primera fila en el navegador (`read` + `sheet_to_json` con `header: 1`) y se guardan los encabezados reales. El mapeo por campo pasa a ser un `SearchableSelect` con opciones `"A — <encabezado>"`; al enviar, el `value` del mapeo es el encabezado real detectado (el backend sigue matcheando por nombre, sin cambios). Botón "Auto-mapear" precarga coincidencias típicas (comparación case-insensitive contra nombres conocidos: Nombre/Artículo, Categoría, Unidad, Medida, Precio, Código). Sin archivo cargado, la sección de mapeo queda deshabilitada con una ayuda. *Alternativas descartadas:* soportar letras en el backend (queda fuera de alcance de esta iteración) o enviar letras crudas (el backend no las soporta).
- **Validación previa anti-400**: antes del submit se valida en cliente: al menos un mapeo; combinaciones requeridas por el backend (`nombre` o `articulo_id`; `medida_id` o `unidad_medida` + `medida`; o la clave única `articulo_medida_combinado`, incompatible con las anteriores; `precio_lista` siempre) y que cada columna asignada exista entre las detectadas sin duplicarse. Si algo falta, se lista en el `Alert` de error y no se envía la solicitud. Los errores de fila que igualmente responda la API se muestran tal como llegan (`ApiError.message`).
- **Escalado de la vista (paginación por proveedor)**: con muchas listas cargadas, traer todos los ítems saturaba la vista y el límite del endpoint recortaba proveedores. Las tarjetas pasan a alimentarse de `GET /listas-precios/cantidad-por-proveedor` (`useCantidadListasPorProveedor`) y los ítems solo se traen del proveedor seleccionado (`useListasPrecios({ proveedor_id }, { enabled })`). El total del encabezado es la suma de cantidades. *Alternativa descartada:* paginar el listado completo — sigue trayendo ítems innecesarios al ingresar.

## Risks / Trade-offs

- [No-admin intenta operar] → La UI oculta las acciones y, si se fuerza el request, la API responde 403 y se muestra el mensaje.
- [Volumen alto de ítems en un único GET] → Se limitan a 100 por defecto (parámetro de la API); si crece, agregar paginación en el frontend como cambio futuro.
- [Ítem eliminado en otra pestaña → 404 al editar] → Se muestra el error y se invalida el listado para que desaparezca.
- [Mapeo de Excel incorrecto → 400/422] → Se muestra `ApiError.message` y el modal permanece abierto con los datos cargados.
- [Cambio en `http.ts` (FormData)] → Afecta solo requests con body `FormData`; el resto del comportamiento queda intacto.
- [Encabezados duplicados o con espacios en el Excel] → Se envía el encabezado detectado tal cual (match exacto del backend); si hay duplicados, el backend resuelve a la última ocurrencia y la UI muestra ambos con su letra para desambiguar.
- [`xlsx` procesa el archivo en el navegador] → Solo se lee la primera fila; el archivo no sale del equipo salvo por el upload final que ya existía.

## Migration Plan

- Cambio frontend-only, sin migración de datos ni de backend.
- Rollback: revertir los archivos afectados (types, `http.ts`, servicio, hook, página); no hay cambios en otros subsistemas.

## Open Questions

None.
