## Purpose

Permite a los clientes MCP y agentes de IA realizar consultas sobre productos, categorías, disponibilidad de stock e historial de movimientos en la base de datos de la ferretería.

## ADDED Requirements

### Requirement: Consultar productos por filtros
El servidor MCP MUST ofrecer la herramienta `search_products` para buscar artículos de ferretería por término de búsqueda (nombre o descripción), SKU o ID de categoría.

#### Scenario: Búsqueda exitosa por nombre de producto
- **WHEN** el cliente invoca `search_products` con el parámetro `query` igual a "Martillo"
- **THEN** el sistema retorna la lista de productos coincidentes con su SKU, nombre, categoría, precio de venta, stock disponible y ubicación en estantería.

### Requirement: Detección de productos con stock mínimo
El servidor MCP MUST ofrecer la herramienta `check_low_stock` para consultar los productos cuya cantidad en stock sea menor o igual a su nivel de stock mínimo configurado.

#### Scenario: Consulta de productos con bajo stock
- **WHEN** el cliente invoca `check_low_stock`
- **THEN** el sistema retorna un listado de productos en estado crítico de inventario junto con la diferencia entre stock actual y mínimo.

### Requirement: Consulta de historial de movimientos de stock
El servidor MCP MUST ofrecer la herramienta `get_stock_movements` para obtener el registro histórico de entradas, salidas o ajustes de stock de un producto específico.

#### Scenario: Histórico de movimientos por producto
- **WHEN** el cliente invoca `get_stock_movements` especificando un `product_id` válido
- **THEN** el sistema retorna la lista de movimientos ordenados cronológicamente detallando tipo de movimiento, cantidad y motivo.
