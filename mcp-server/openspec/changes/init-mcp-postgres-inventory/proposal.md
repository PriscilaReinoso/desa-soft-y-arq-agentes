## Why

Se requiere implementar un servidor MCP (Model Context Protocol) inicial en Python que permita a los agentes de IA consultar información de inventario de una ferretería almacenada en una base de datos PostgreSQL. Para facilitar el desarrollo y pruebas locales de forma aislada y reproducible, la base de datos se ejecutará mediante Docker Compose cargando datos ficticios de prueba.

## What Changes

- Creación de un servidor MCP en Python utilizando `FastMCP` (o SDK oficial de MCP) estructurado con tipado estricto (`pydantic` / `psycopg3`).
- Implementación de herramientas MCP (*tools*) descriptivas en `snake_case` para:
  - `search_products`: Buscar productos por nombre, SKU o categoría.
  - `get_product_details`: Obtener detalles completos de un producto por ID o SKU.
  - `check_low_stock`: Listar productos cuyo stock esté por debajo del nivel mínimo (`min_stock_level`).
  - `list_categories`: Listar las categorías de productos disponibles.
  - `get_stock_movements`: Consultar el historial de entradas/salidas de stock por producto.
- Integración con el contenedor Docker de PostgreSQL existente (`docker-compose.yml` y script `docker/init.sql`).
- Actualización del archivo de configuración `mcp_config.json` para registrar el servidor MCP de inventario de ferretería.
- Configuración de variables de entorno mediante `.env` para la conexión a la base de datos PostgreSQL.

## Capabilities

### New Capabilities
- `inventory-query`: Herramientas MCP para consultar productos, categorías, niveles de stock y movimientos de la ferretería en PostgreSQL.
- `docker-postgres-env`: Entorno de base de datos PostgreSQL en Docker Compose con datos iniciales de inventario de ferretería.

### Modified Capabilities
*(Ninguna)*

## Impact

- **Código base**: Nuevo código de servidor MCP en Python en `src/server.py` (o paquete `src/`).
- **Base de datos**: Conexión a la instancia de PostgreSQL local (`ferreteria-db` en puerto 5432).
- **Configuración**: Actualización de `mcp_config.json` y `.env`.
