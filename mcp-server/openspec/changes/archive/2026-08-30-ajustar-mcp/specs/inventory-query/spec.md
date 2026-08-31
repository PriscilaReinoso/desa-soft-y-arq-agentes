## ADDED Requirements

### Requirement: Consultar artículos por filtros
El servidor MCP MUST ofrecer la herramienta `search_products` para buscar
artículos de ferretería por término de búsqueda (nombre o descripción) o ID de
categoría, consultando las tablas `articulo` y `categoria` del esquema actual.

#### Scenario: Búsqueda exitosa por nombre de artículo
- **WHEN** el cliente invoca `search_products` con el parámetro `query` igual a "Martillo"
- **THEN** el sistema retorna la lista de artículos coincidentes con su nombre,
  descripción, ID de categoría y nombre de categoría.

#### Scenario: Filtro por categoría
- **WHEN** el cliente invoca `search_products` con el parámetro `category_id`
- **THEN** el sistema filtra los artículos por la categoría indicada y retorna
  solo los que pertenecen a ella.

### Requirement: Consulta de detalle de un artículo
El servidor MCP MUST ofrecer la herramienta `get_product_details` para obtener
la ficha de un artículo por su `product_id` (UUID de la tabla `articulo`),
incluyendo sus variantes de inventario con stock, precio de venta y ubicación.

#### Scenario: Detalle de artículo por ID
- **WHEN** el cliente invoca `get_product_details` con un `product_id` válido
- **THEN** el sistema retorna la ficha del artículo con sus variantes de
  inventario (stock, mínimo, precio de venta, medida y ubicación).

#### Scenario: Detalle de artículo no encontrado
- **WHEN** el cliente invoca `get_product_details` con un `product_id` que no
  existe
- **THEN** el sistema retorna un estado `not_found` indicando que no se
  encontró el artículo.

### Requirement: Artículos con stock bajo
El servidor MCP MUST ofrecer la herramienta `check_low_stock` para listar las
variantes de inventario cuya `stock` sea menor o igual a su `minimo_stock`,
ordenadas por déficit descendente.

#### Scenario: Consulta de artículos con stock bajo
- **WHEN** el cliente invoca `check_low_stock`
- **THEN** el sistema retorna el listado de variantes de inventario en estado
  crítico con el artículo, stock actual, stock mínimo y el déficit calculado.

### Requirement: Consulta de categorías
El servidor MCP MUST ofrecer la herramienta `list_categories` para listar
todas las categorías de la tabla `categoria` con su `id`, `nombre` y
`descripcion`.

#### Scenario: Listado de categorías
- **WHEN** el cliente invoca `list_categories`
- **THEN** el sistema retorna el listado de categorías con su id, nombre y
  descripción, ordenadas por nombre.

### Requirement: Consulta del stock del inventario
El servidor MCP MUST ofrecer la herramienta `get_stock_inventory` para obtener
el stock actual de las variantes de inventario, opcionalmente filtrado por
artículo, indicando medida y ubicación.

#### Scenario: Stock de inventario por artículo
- **WHEN** el cliente invoca `get_stock_inventory` con un `article_id` válido
- **THEN** el sistema retorna el stock actual de las variantes de inventario de
  ese artículo con medida y ubicación.
