"""Reusable business logic for semantic search over the inventory.

Builds enriched text per article, generates embeddings locally with
`all-MiniLM-L6-v2` (lazily loaded) and queries PostgreSQL/pgvector by
cosine similarity. Keeps the MCP tool thin and reusable.
"""

from functools import lru_cache
from typing import Any, Dict, List, Optional

from app.core.database import execute_query

# all-MiniLM-L6-v2 supports up to 256 tokens; keep enriched text well below it.
MAX_TEXT_CHARS = 1200


@lru_cache(maxsize=1)
def _get_model():
    """Lazily loads (and caches) the sentence-transformers embedding model."""
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer("all-MiniLM-L6-v2")


def build_enriched_text(article: Dict[str, Any]) -> str:
    """Builds a single enriched text per article (name, description, category, measure).

    The measure (unit + value) contributes more semantic context than other fields,
    so it is always included when available. Returns a string within the model's
    token limit.
    """
    parts = [article.get("nombre") or ""]

    descripcion = (article.get("descripcion") or "").strip()
    if descripcion:
        parts.append(f"Descripción: {descripcion}")

    categoria = (article.get("categoria_nombre") or "").strip()
    if categoria:
        parts.append(f"Categoría: {categoria}")

    medidas = article.get("medidas") or []
    if medidas:
        medida_text = ", ".join(
            f"{m.get('medida')} {m.get('unidad_medida')}".strip() or "s/d"
            for m in medidas
            if m.get("medida") or m.get("unidad_medida")
        )
        if medida_text:
            parts.append(f"Medida: {medida_text}")

    text = " - ".join(parts)
    return text[:MAX_TEXT_CHARS]


def _load_articles(articulo_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns articles with their enriched fields and aggregated measures."""
    sql = """
        SELECT
            a.id,
            a.nombre,
            a.descripcion,
            c.nombre AS categoria_nombre,
            ARRAY_AGG(DISTINCT jsonb_build_object('medida', m.medida, 'unidad_medida', m.unidad_medida))
                FILTER (WHERE m.id IS NOT NULL) AS medidas
        FROM articulo a
        LEFT JOIN categoria c ON a.categoria_id = c.id
        LEFT JOIN inventario i ON i.articulo_id = a.id
        LEFT JOIN medida m ON i.medida_id = m.id
        WHERE 1=1
    """
    params: tuple = ()
    if articulo_id:
        sql += " AND a.id = %s GROUP BY a.id, c.nombre"
        params = (articulo_id,)
    else:
        sql += " GROUP BY a.id, c.nombre"

    sql += " ORDER BY a.nombre ASC"
    return execute_query(sql, params)


def _vector_to_sql(embedding: List[float]) -> str:
    """Serializes an embedding list into a pgvector literal (e.g. '[0.1,0.2,...]')."""
    return "[" + ",".join(f"{v:.6f}" for v in embedding) + "]"


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generates embeddings for a list of texts using the locally-cached model."""
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vectors]


def index_article(articulo_id: Optional[str] = None) -> int:
    """(Re)builds embeddings for all articles (or a single one) into articulo_embedding.

    Returns the number of articles indexed.
    """
    articles = _load_articles(articulo_id)
    if not articles:
        return 0

    texts = [build_enriched_text(a) for a in articles]
    vectors = embed_texts(texts)

    count = 0
    for idx, (article, vector) in enumerate(zip(articles, vectors)):
        sql = """
            INSERT INTO articulo_embedding (articulo_id, texto_enriquecido, embedding)
            VALUES (%s, %s, %s::vector)
            ON CONFLICT (articulo_id) DO UPDATE
                SET texto_enriquecido = EXCLUDED.texto_enriquecido,
                    embedding = EXCLUDED.embedding
            RETURNING articulo_id
        """
        execute_query(sql, (article["id"], texts[idx], _vector_to_sql(vector)))
        count += 1
    return count


def semantic_search(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Returns the articles most semantically similar to the query, by cosine distance."""
    query_embedding = embed_texts([query])[0]
    vector_literal = _vector_to_sql(query_embedding)

    sql = f"""
        SELECT
            a.id,
            a.nombre,
            a.descripcion,
            c.nombre AS categoria_nombre,
            ae.texto_enriquecido,
            (ae.embedding <=> %s::vector) AS distance
        FROM articulo_embedding ae
        JOIN articulo a ON a.id = ae.articulo_id
        LEFT JOIN categoria c ON a.categoria_id = c.id
        ORDER BY ae.embedding <=> %s::vector ASC
        LIMIT %s
    """
    rows = execute_query(sql, (vector_literal, vector_literal, limit))

    results = []
    for row in rows:
        row["score"] = round(1.0 - float(row["distance"]), 6)
        results.append(row)
    return results
