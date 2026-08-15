## Context

La vista de inventario (`src/pages/InventoryPage.tsx`) se alimenta de `src/data/mock.ts`. El backend ya expone `GET /api/v1/inventarios`, `POST /api/v1/inventarios/alta` y los maestros (artículos, categorías, medidas, depósitos, espacios), todos protegidos con JWT. `src/services/http.ts` ya inyecta el `Bearer` token y ante 401 limpia el token y dispara `UNAUTHORIZED_EVENT` (el AuthContext redirige al login). El `inventario.service.ts` actual usa un payload plano e incorrecto (`createInventario` → `POST /inventarios`); el endpoint real es `POST /inventarios/alta` con payload anidado. Los tipos de dominio (`Categoria`, `Medida`, `Articulo`, `Deposito`, `Espacio`) ya existen y coinciden con los schemas del backend. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Que la vista de inventario muestre datos reales de la API con los nombres resueltos en el cliente.
- Alta de inventario contra `POST /api/v1/inventarios/alta` con el payload del swagger.
- Reutilizar la infraestructura existente (http.ts, TanStack Query, hooks stub).

**Non-Goals:**
- No modificar el backend ni su spec (los endpoints se consumen tal cual).
- No agregar paginación cliente-servidor ni eliminación/edición de registros de inventario.
- No refactorizar el resto de las páginas que aún usan mock.

## Decisions

**D1. Los nombres resueltos llegan embebidos desde el backend.**
`GET /api/v1/inventarios` devuelve `InventarioOut` con `articulo` (incluye `categoria`), `medida` y `espacio` (incluye `deposito`). El frontend mapea esa respuesta a `InventarioRow` sin consultar maestros para la tabla.
*Alternativas:* resolver nombres en el cliente con Maps consultando los maestros (quedó obsoleta cuando el backend pasó a embeder los objetos, commit `4774f65`) o agregar un endpoint de join (innecesario). Los maestros (`/articulos`, `/categorias`, `/medidas`, `/depositos`, `/espacios`) se cargan únicamente para los selectores del formulario de alta.

**D2. Hooks de TanStack Query por recurso, compuestos con `useQueries` en la página.**
Se completan los services/hooks stub (`useArticulos`, `useCategorias`, `useMedidas`, `useDepositos`, `useEspacios`) y `useInventarios` para el listado. La página usa `useQueries` para disparar las consultas en paralelo y muestra carga/error por estado de las queries.
*Alternativa:* un solo hook orquestador; se descarta por simplicidad y por reutilización futura de los hooks de maestros.

**D3. Alta vía `POST /inventarios/alta` con payload anidado.**
Se reemplaza `createInventario` por `altaInventario(payload: InventarioAlta)` con la forma del swagger: `articulo: {id} | {nombre, categoria_id}`, `medida: {id} | {unidad_medida, medida}`, `espacio: {id} | {deposito_id}` (opcional), `fila`, `columna`, `stock`, `precio_venta`. El formulario ofrece selectores de registros existentes o creación inline; al confirmar se construye el payload según el modo elegido. Un `useMutation` con `onSuccess` invalida `['inventarios']` para refrescar el listado.

**D4. Estados de carga/error delegados a la infraestructura.**
El 401 ya se maneja en `http.ts` (`clearToken` + `UNAUTHORIZED_EVENT`); la página solo muestra `isLoading`/`isError` de TanStack Query. No se agrega lógica nueva de sesión.

**D5. Tipos nuevos en `domain.ts`.**
`InventarioAltaPayload` (payload anidado del alta) y `InventarioRow` (fila de la tabla como proyección de `InventarioOut`: categoría y artículo desde `articulo`, medida compuesta desde `medida`, depósito, espacio, fila, columna, stock, precio_venta).

## Risks / Trade-offs

- **Volumen de datos** — Cargar todos los maestros + inventarios en memoria puede crecer con el catálogo → Mitigación: los maestros se cachean con TanStack Query (staleness), y si el volumen crece se introduce paginación del listado como cambio futuro.
- **Dependencia de múltiples endpoints** — Si falla un maestro, la página puede quedar incompleta → Mitigación: los maestros se cargan con queries independientes y fallos parciales se muestran como error de la tabla.
- **Creación inline vs. existencia previa** — El backend valida unicidad por nombre → Mitigación: mostrar el error de la API (`ApiError.detail`) en el formulario.
- **Rol ADMIN** para el alta — Si el usuario no tiene el rol, el backend responde 403 → Mitigación: mostrar el mensaje del `ApiError` y conservar el listado intacto.
