## 1. Entorno de Base de Datos y Docker

- [x] 1.1 Verificar y validar la infraestructura de PostgreSQL en Docker Compose (`docker-compose.yml`) y la carga del esquema inicial de ferretería (`docker/init.sql`).
- [x] 1.2 Configurar las credenciales y parámetros de conexión en `.env` (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`).

## 2. Desarrollo del Servidor MCP de Ferretería

- [x] 2.1 Crear el módulo principal del servidor MCP (`src/server.py`) configurando `FastMCP` y la gestión de pool de conexiones PostgreSQL con `psycopg`.
- [x] 2.2 Implementar la herramienta MCP `search_products` para buscar productos por término, SKU o ID de categoría.
- [x] 2.3 Implementar la herramienta MCP `get_product_details` para consultar la ficha completa de un producto por ID o SKU.
- [x] 2.4 Implementar la herramienta MCP `check_low_stock` para identificar artículos críticos con stock menor o igual a `min_stock_level`.
- [x] 2.5 Implementar las herramientas `list_categories` y `get_stock_movements` para consultar catálogo de categorías y movimientos de inventario.
- [x] 2.6 Integrar manejo de errores seguro en todas las herramientas devolviendo respuestas estructuradas sin colapsar el proceso del servidor.

## 3. Configuración e Integración MCP

- [x] 3.1 Registrar la ejecución del servidor MCP en `mcp_config.json`.
- [x] 3.2 Ejecutar pruebas de integración verificando la respuesta de las herramientas MCP conectadas al contenedor Docker.
