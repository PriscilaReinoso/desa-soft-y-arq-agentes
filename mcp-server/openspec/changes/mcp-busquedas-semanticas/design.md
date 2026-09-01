## Context

El proyecto expone un MCP Server en Python (FastMCP) con herramientas de consulta sobre PostgreSQL. Las búsquedas actuales (`search_products`) son textuales (LIKE sobre nombre/descripción). El requerimiento IF-34 pide una nueva tool que realice búsquedas semánticas vectorizando la base con pgvector. Se decide: modelo de embeddings local `all-MiniLM-L6-v2` (384 dims), texto enriquecido por artículo (nombre + descripción + categoría + medida). Ver `proposal.md` para la motivación y `specs/semantic-search/spec.md` para los requisitos.

## Goals / Non-Goals

**Goals:**
- Exponer la herramienta MCP `semantic_search` que consulta por similitud de vectores.
- Vectorizar el catálogo con embeddings enriquecidos por artículo sin superar el límite de tokens del modelo.
- Almacenar los vectores en PostgreSQL mediante la extensión `pgvector`.
- Mantener la generación de embeddings local (sin API externa ni costos) y seguir la arquitectura por capas (`app/tools`, `app/services`, `app/core`).

**Non-Goals:**
- Búsqueda híbrida (textual + semántica combinadas) en esta fase.
- Chunking de textos largos (las descripciones actuales caben en el límite del modelo tras enriquecer).
- Reindexación automática/incremental en tiempo real ante cambios de stock o precio (se provee script de indexación bajo demanda).
- Autenticación o control de acceso en la capa MCP.

## Decisions

### Decision 1: Modelo de embeddings local `all-MiniLM-L6-v2`
- **Opción elegida:** `sentence-transformers` con `all-MiniLM-L6-v2` (vector de 384 dimensiones), ejecutado localmente.
- **Justificación:** Sin costo por API ni manejo de claves, offline y con calidad suficiente para textos cortos del catálogo. 384 dimensiones mantiene los vectores livianos en PostgreSQL.
- **Alternativas consideradas:** OpenAI `text-embedding-3-small` (1536 dims, mejor calidad pero implica API externa, `OPENAI_API_KEY` y latencia de red); `all-mpnet-base-v2` (768 dims, más pesado). Se descartaron por costo/dependencia externa y requerimiento de recursos.

### Decision 2: Texto enriquecido por artículo para el embedding
- **Opción elegida:** Buildar un texto único por artículo concatenando nombre, descripción, categoría, medida y precio de venta.
- **Justificación:** La medida (unidad + valor) aporta más contexto semántico que el proveedor; enriquecer con categoría/medida/precio mejora la discriminación entre artículos de igual nombre. El texto resultante queda dentro del límite de 256 tokens de `all-MiniLM-L6-v2`.
- **Alternativas consideradas:** Vectorizar solo nombre+descripción (menor calidad); incluir también proveedor (aporta menos semántica que medida). Se descartó el proveedor por menor valor agregado.

### Decision 3: `pgvector` como almacén de embeddings
- **Opción elegida:** Extensión PostgreSQL `pgvector` con la columna `embedding vector(384)`, búsqueda por similitud de coseno (`<=>`).
- **Justificación:** Evita introducir un store vectorial separado (p. ej. ChromaDB/Faiss): los vectores viven junto al catálogo, se obtiene resultado relacional con el `articulo` y se reutiliza el pool de conexiones existente.
- **Alternativas consideradas:** Motor de búsqueda vectorial dedicado. Se descartó por agregar infraestructura adicional sin beneficio claro a esta escala.

### Decision 4: Estructura por capas acorde a AGENTS.md
- **Opción elegida:**
  - `app/services/semantic_search.py` → lógica de embeddings (carga del modelo, vectorización del texto enriquecido) y queries de similitud.
  - `app/tools/semantic_search.py` → tool MCP `semantic_search(query, limit)` con manejo de errores.
  - `app/server.py` → registro de la nueva tool.
- **Justificación:** Mantiene una única responsabilidad por archivo y centraliza el acceso a datos (y la ejecución de queries) en la capa de servicios, como las demás tools del proyecto.

### Decision 5: Modelo cargado perezosamente
- **Opción elegida:** Cargar el modelo de embeddings de forma perezosa/cacheada (singleton) la primera vez que se necesita, no al arrancar el servidor.
- **Justificación:** `all-MiniLM-L6-v2` tarda en cargar (~pocos MB pero con torch). Evita penalizar el arranque del MCP Server si no se usa búsqueda semántica.
- **Alternativas consideradas:** Carga en el módulo al importar. Se descartó por aumentar el tiempo de inicio y el consumo de memoria aunque no se use la feature.

## Risks / Trade-offs

- **[Riesgo: Descarga inicial del modelo]**: En el primer uso, `sentence-transformers` descarga los pesos de `all-MiniLM-L6-v2` (requiere internet). → **Mitigación:** Documentar y, en el primer uso, permitir la descarga; el resultado queda cacheado localmente para usos posteriores offline.
- **[Riesgo: Dependencias pesadas (`torch` ~800MB)]**: Aumenta el tamaño del entorno y la imagen. → **Mitigación:** Aceptar el costo por el beneficio de embeddings locales sin API key; documentar el impacto en `requirements.txt`.
- **[Riesgo: Catálogo desactualizado en la tabla de embeddings]**: Si se agregan/modifican artículos, los embeddings pueden quedar viejos. → **Mitigación:** Proveer script/CLI de (re)indexación bajo demanda; documentar cómo ejecutarlo.
- **[Riesgo: `pgvector` no disponible en PostgreSQL]**: Extensión requiere soporte en la imagen del contenedor. → **Mitigación:** Usar imagen `pgvector/pgvector` o instalar el paquete en `docker-compose` y habilitar `CREATE EXTENSION`.
