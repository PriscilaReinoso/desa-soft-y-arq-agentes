"""CLI de indexación de embeddings del catálogo (bajo demanda).

Genera (o regenera) los embeddings enriquecidos de los artículos en la tabla
`articulo_embedding`. Uso:

    python -m app.scripts.index_embeddings          # indexa todo el catálogo
    python -m app.scripts.index_embeddings <UUID>   # indexa un solo artículo

Requerimientos: PostgreSQL en marcha con pgvector y el modelo de embeddings
descargable en el primer uso.
"""

import sys

from app.services.semantic_search import index_article


def main() -> int:
    articulo_id = sys.argv[1] if len(sys.argv) > 1 else None
    count = index_article(articulo_id)
    print(f"Artículos indexados: {count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
