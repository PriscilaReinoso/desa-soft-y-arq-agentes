## 1. Estructura de carpetas

- [x] 1.1 Crear la estructura `app/core/`, `app/tools/` y `app/services/` según `AGENTS.md`.
- [x] 1.2 Mover `src/db.py` a `app/core/database.py` manteniendo la lógica de conexión y consulta.
- [x] 1.3 Extraer la lectura de variables de entorno a `app/core/config.py`.
- [x] 1.4 Crear el punto de entrada `app/server.py` que registra e inicia el MCP Server.
- [x] 1.5 Eliminar la carpeta `src/` antigua una vez migrado el código.
- [x] 1.6 Actualizar `README.md` y referencias de rutas en `AGENTS.md` a la nueva estructura.

## 2. Ajuste de tools al esquema de la base

- [x] 2.1 Crear `docs/db_schema.md` documentando las tablas `categories`, `suppliers`, `products` y `stock_movements` según `docker/init.sql`.
- [x] 2.2 Alinear `search_products` a las columnas de `products`, `categories` y `suppliers`.
- [x] 2.3 Alinear `get_product_details` a los campos de la ficha (`unit_price`, `cost_price`, `stock`, `location_rack`, fechas, categoría y proveedor).
- [x] 2.4 Alinear `check_low_stock` al cálculo de déficit sobre `stock_quantity` y `min_stock_level`.
- [x] 2.5 Alinear `list_categories` a los campos `id`, `name` y `description` de `categories`.
- [x] 2.6 Alinear `get_stock_movements` a la tabla `stock_movements` (tipo, cantidad, motivo y fecha).

## 3. Capa de tools y servicios

- [x] 3.1 Ubicar las tools MCP en `app/tools/` manteniendo los nombres `snake_case` y descripciones en español.
- [x] 3.2 Trasladar la lógica de negocio reutilizable a `app/services/` si corresponde.
- [x] 3.3 Garantizar que las tools utilicen solo la capa `core` para acceder a la base.

## 4. Verificación

- [x] 4.1 Ajustar las rutas de importación de los tests existentes.
- [x] 4.2 Ejecutar la suite de pytest y corregir fallas.
- [x] 4.3 Validar manualmente que cada tool retorna los datos esperados contra el esquema real.
