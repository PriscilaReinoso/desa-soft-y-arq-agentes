# MCP Server — Inventario Ferretería

Servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io) construido con **FastMCP**. Expone herramientas para consultar productos, categorías, stock crítico y movimientos de una base PostgreSQL de ferretería.

## Funcionamiento

- Comunicacion stidio con bot-chat, este lo invoca.

## Estructura

```
app/
  server.py              # Punto de entrada de MCP.
  core/
    config.py            # Configuración de la aplicación y variables de entorno.
    database.py          # Conexión y consultas a PostgreSQL.
  tools/
    inventory.py         # Herramientas MCP de consulta de inventario.
  services/
    inventory.py         # Lógica de negocio reutilizable de inventario.
docs/
  db_schema.md           # Documentación del esquema de la base de datos.
tests/                   # Pruebas unitarias e integración con pytest.
```

## Herramientas

| Tool | Descripción |
|---|---|
| `search_products` | Busca productos por nombre, SKU, descripción o categoría |
| `get_product_details` | Ficha completa de un producto por ID o SKU |
| `check_low_stock` | Lista productos bajo su stock mínimo |
| `list_categories` | Lista las categorías |
| `get_stock_movements` | Historial de movimientos de un producto |
