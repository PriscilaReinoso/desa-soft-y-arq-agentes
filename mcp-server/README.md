# MCP Server — Inventario Ferretería

Servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io) construido con **FastMCP**. Expone herramientas para consultar productos, categorías, stock crítico y movimientos de una base PostgreSQL de ferretería.

## Funcionamiento

- Comunicacion stidio con bot-chat, este lo invoca.

## Herramientas

| Tool | Descripción |
|---|---|
| `search_products` | Busca productos por nombre, SKU, descripción o categoría |
| `get_product_details` | Ficha completa de un producto por ID o SKU |
| `check_low_stock` | Lista productos bajo su stock mínimo |
| `list_categories` | Lista las categorías |
| `get_stock_movements` | Historial de movimientos de un producto |
