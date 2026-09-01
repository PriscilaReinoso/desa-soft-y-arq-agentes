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
    semantic_search.py   # Herramienta MCP de búsqueda semántica.
  services/
    inventory.py         # Lógica de negocio reutilizable de inventario.
    semantic_search.py   # Lógica de embeddings y búsqueda por similitud (pgvector).
  scripts/
    index_embeddings.py  # CLI de indexación de embeddings bajo demanda.
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
| `semantic_search` | Busca productos por significado usando embeddings y pgvector (consulta en lenguaje natural) |

## Búsqueda semántica

La búsqueda semántica (`semantic_search`) encuentra artículos por **significado**, no solo por coincidencia textual. Usa un modelo local de embeddings (`all-MiniLM-L6-v2`, 384 dimensiones) y la extensión PostgreSQL **pgvector**.

### Cómo funciona

Hay dos momentos separados:

1. **Indexación (offline)**: se genera el embedding de **cada artículo** y se guarda en la tabla `articulo_embedding`. No ocurre automáticamente al consultar: se ejecuta bajo demanda con el CLI (ver más abajo). Los vectores quedan persistentes en la base de datos.

2. **Consulta (online)**: cuando se invoca `semantic_search(query)`, solo se genera el embedding de **la consulta del usuario** en vivo, y se compara por similitud de coseno contra los embeddings **ya guardados** de los artículos. No se vuelve a vectorizar el catálogo en cada consulta.

```
Indexación: emb(artículo)  -> se guarda en articulo_embedding (1 vez / bajo demanda)
Consulta:   emb(query)     -> se compara contra los guardados -> top K resultados
```

### Indexar el catálogo

Es necesaria una indexación previa para que la búsqueda devuelva resultados. Para indexar (o reindexar) todos los artículos:

```bash
python -m app.scripts.index_embeddings
# o un solo artículo:
python -m app.scripts.index_embeddings <UUID-articulo>
```

> Requiere la base de datos corriendo con la extensión `pgvector` y la tabla `articulo_embedding` creadas (ver `init.sql` de la raíz del repo).

> Si el catálogo cambia (artículos nuevos o editados), reindexa para que sus embeddings queden actualizados.

