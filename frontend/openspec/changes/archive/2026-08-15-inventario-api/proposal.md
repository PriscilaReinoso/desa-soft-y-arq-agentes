## Why

La vista de inventario muestra datos mock, pero el backend ya expone los endpoints reales (`GET /api/v1/inventarios`, `POST /api/v1/inventarios/alta`, y los maestros de artículos, categorías, medidas, depósitos y espacios). El caso de uso `docs/spec.md` requiere que la vista muestre la información real de la API (Categoría - Artículo - Medida - Stock - Ubicación - P. Venta) y que el alta "+ Nuevo artículo" use el alta de inventario de la API.

## What Changes

- Modificar la vista de inventario para que **lea los datos de la API** (`GET /api/v1/inventarios`) en lugar del mock; el backend ya devuelve los nombres resueltos de forma embebida (`articulo` con `categoria`, `medida`, `espacio` con `deposito`).
- **Reemplazar las columnas** de la tabla por las del caso de uso: Categoría, Artículo, Medida, Stock, Ubicación (espacio, fila, columna y depósito) y P. Venta.
- Modificar el formulario "+ Nuevo artículo" para que envíe un **alta de inventario** (`POST /api/v1/inventarios/alta`) con los parámetros definidos en el swagger (`articulo`, `medida`, `espacio`, `fila`, `columna`, `stock`, `precio_venta`), permitiendo seleccionar registros existentes (cargados de los endpoints maestros) o crearlos en línea.
- Agregar manejo de estados de carga, error y sesión expirada (401) en la vista.
- **BREAKING**: se elimina el uso de datos mock en la página de inventario; la vista depende del backend.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities
- `inventario`: cambian los requisitos de la tabla (columnas Categoría, Artículo, Medida, Stock, Ubicación, P. Venta) y del alta de artículo (ahora usa `POST /api/v1/inventarios/alta` con los parámetros del swagger y carga selectores desde la API).

## Impact

- `frontend/src/pages/InventoryPage.tsx` — reescritura para consumir la API y el nuevo modelo de fila.
- `frontend/src/types/domain.ts` — nuevos tipos para la fila de inventario (con nombres resueltos) y para el payload del alta.
- `frontend/src/services/inventario.service.ts` — agregar función `altaInventario()` contra `POST /inventarios/alta`.
- `frontend/src/services/` — conectar los servicios stub existentes (articulos, categorias, medidas, depositos, espacios) a los endpoints reales y usarlos en la página.
- `frontend/src/hooks/` — hooks de TanStack Query para inventarios y maestros con invalidación tras el alta.
- `frontend/src/data/mock.ts` — deja de alimentar la vista de inventario.
- API consumida: `GET /api/v1/inventarios` (con `articulo`/`categoria`, `medida`, `espacio`/`deposito` embebidos) y `POST /api/v1/inventarios/alta`. Los endpoints maestros (`/api/v1/articulos`, `/api/v1/categorias`, `/api/v1/medidas`, `/api/v1/depositos`, `/api/v1/espacios`) se consumen únicamente para los selectores del formulario de alta. Todas las llamadas autenticadas con JWT.
