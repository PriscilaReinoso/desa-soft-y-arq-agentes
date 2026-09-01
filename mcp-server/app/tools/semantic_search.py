"""MCP tool for semantic search over the inventory.

Delegates to the semantic_search service layer and returns structured
responses with graceful error handling, following the project conventions.
"""

from typing import Any, Dict

from app.services import semantic_search as semantic_search_service


def semantic_search(query: str, limit: int = 10) -> Dict[str, Any]:
    """Busca artículos de ferretería por similitud semántica usando embeddings (pgvector).

    Args:
        query: Consulta en lenguaje natural (p. ej. "herramienta para clavar").
        limit: Cantidad máxima de resultados a retornar (por defecto 10).

    Returns:
        Dict con los artículos más similares ordenados por score, o mensaje de error.
    """
    if not query or not query.strip():
        return {
            "status": "error",
            "isError": True,
            "message": "Debe proporcionar una consulta 'query'.",
        }

    try:
        results = semantic_search_service.semantic_search(query.strip(), limit)
        return {
            "status": "success",
            "total": len(results),
            "results": results,
        }
    except Exception as err:
        return {"status": "error", "isError": True, "message": str(err)}
