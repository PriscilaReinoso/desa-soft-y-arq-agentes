## Why

Las herramientas actuales de búsqueda de productos (`search_products`) solo permiten coincidencias por texto exacto o parcial sobre nombre y descripción. Un usuario que consulta "herramienta para cortar metal" no obtiene resultados útiles porque no hay coincidencia literal con "sierra de calar". Las búsquedas semánticas permiten encontrar productos por significado, no solo por keywords, mejorando la experiencia del agente de IA al interactuar con el inventario de ferretería.

## What Changes

- Nueva herramienta MCP `semantic_search` que realiza búsqueda por similitud de vectores (embeddings) sobre los artículos del catálogo.
- Integración de la extensión `pgvector` en PostgreSQL para almacenar y consultar vectores de embeddings.
- Pipeline de indexación que genera embeddings enriquecidos (artículo + categoría + medida + precio) para cada producto del catálogo.
- Nuevas dependencias: `pgvector` (extensión PostgreSQL), `sentence-transformers` y `torch` (modelo de embeddings local).

## Capabilities

### New Capabilities
- `semantic-search`: Búsqueda semántica de artículos de ferretería mediante embeddings vectoriales, permitiendo consultas en lenguaje natural que matchean por significado plutôt que por coincidencia textual.

### Modified Capabilities
*(Ninguna)*

## Impact

- **Código**: Nuevos módulos `app/tools/semantic_search.py` (tool MCP) y `app/services/semantic_search.py` (lógica de embedding y consulta). Registro en `app/server.py`.
- **Base de datos**: Extensión `pgvector` en PostgreSQL, nueva tabla `articulo_embedding`, función SQL de búsqueda por similitud de coseno.
- **Dependencias**: `sentence-transformers`, `torch` (~800MB) en `requirements.txt`.
- **Docker**: Instalación de extensión `pgvector` en la imagen de PostgreSQL (`docker-compose.yml`).
- **Referencia**: IF-34 — https://reinoso-yesica-priscila.atlassian.net/browse/IF-34
