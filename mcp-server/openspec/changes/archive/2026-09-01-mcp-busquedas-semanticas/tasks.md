## 1. Base de datos y pgvector

- [x] 1.1 Actualizar `docker-compose.yml` para usar una imagen PostgreSQL con soporte de `pgvector` (p. ej. `pgvector/pgvector:pg16`) e instalar la extensión en `docker/init.sql` mediante `CREATE EXTENSION IF NOT EXISTS vector`.
- [x] 1.2 Crear la tabla `articulo_embedding` con `articulo_id UUID FK -> articulo.id`, `texto_enriquecido TEXT NOT NULL` y `embedding vector(384) NOT NULL`, con índice de similitud de coseno (HNSW o IVFFlat).
- [x] 1.3 Agregar las dependencias `sentence-transformers` y `torch` a `requirements.txt`.

## 2. Servicio de embeddings y búsqueda

- [x] 2.1 Crear `app/services/semantic_search.py` con la carga perezosa (singleton) del modelo `all-MiniLM-L6-v2`.
- [x] 2.2 Implementar la construcción del texto enriquecido por artículo (nombre + descripción + categoría + medida + precio de venta) sin exceder el límite de tokens del modelo.
- [x] 2.3 Implementar la generación del embedding de la consulta y la función SQL de búsqueda por similitud de coseno (`<=>`), devolviendo los artículos más similares con su score.

## 3. Tool MCP `semantic_search`

- [x] 3.1 Crear `app/tools/semantic_search.py` con la tool `semantic_search(query: str, limit: int = 10)` que delegue al servicio y maneje errores devolviendo respuestas estructuradas (`isError: true` si falla).
- [x] 3.2 Registrar la tool `semantic_search` en `app/server.py`.
- [x] 3.3 Proveer un script/CLI de indexación bajo demanda que genere los embeddings de todos los artículos del catálogo en `articulo_embedding`.

## 4. Verificación e integración

- [x] 4.1 Ejecutar el script de indexación sobre el catálogo y verificar que los artículos tengan embeddings cargados.
- [x] 4.2 Probar `semantic_search` con consultas en lenguaje natural (p. ej. "herramienta para clavar", "artículo para pintar superficies") verificando resultados relevantes y el límite de `limit`.
- [x] 4.3 Verificar el manejo de errores (PostgreSQL caído, consulta sin resultados) en la tool MCP.
