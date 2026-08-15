## Why

En el frontend no se pueden editar los datos del artículo (nombre, descripción y
categoría) ni la medida de un ítem desde el modal de edición del inventario, y
los selects de medida no permiten buscar: con catálogos grandes resulta
imposible encontrar la medida correcta.

## What Changes

- El modal de edición de un ítem de inventario permite modificar los datos del
  artículo vinculado (nombre, descripción y categoría) y la medida del ítem,
  además de los campos ya editables (espacio, ubicación, stock, stock mínimo,
  precio de venta y medida de venta).
- El backend `PUT /inventarios/{id}` pasa a aceptar `medida_id` para cambiar la
  medida del ítem, validando que la medida exista y que no exista otro ítem no
  eliminado con la misma combinación artículo + medida.
- Los selects de medida ("Medida" y "Medida de venta") del formulario de alta y
  del modal de edición se reemplazan por un select buscable (combobox) que filtra
  las medidas por texto.
- Se reutiliza un componente de combobox buscable para medida y medida de venta.

## Capabilities

### New Capabilities
- (ninguna)

### Modified Capabilities
- `inventario`: el modal de edición pasa a editar también artículo (nombre,
  descripción y categoría) y medida del ítem; los selectores de medida del alta y
  la edición pasan a ser buscables.

## Impact

- **Backend**: `backend/app/schemas/inventario.py` (agregar `medida_id` a
  `InventarioUpdate`) y `backend/app/services/inventario_service.py`
  (validación y aplicación de `medida_id` en `update`). No hay migración de
  base de datos.
- **Frontend**: `src/pages/InventoryPage.tsx` (modal de edición y alta), nuevo
  componente de combobox en `src/components/ui/`, hook de categorías/artículos
  con mutations para `updateArticulo` y `updateInventario`.
- Endpoints ya existentes que se reutilizan: `PUT /articulos/{id}`,
  `GET /articulos`, `GET /categorias`, `GET /medidas`.
