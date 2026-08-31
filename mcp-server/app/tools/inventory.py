"""MCP tools for inventory queries.

Each tool keeps its public name and parameters, delegating the query logic to
the inventory services layer. Tools are plain functions; the FastMCP server in
app/server.py registers them.
"""

from typing import Any, Dict, Optional

from app.services import inventory as inventory_service


def search_products(
    query: str = "", category_id: Optional[str] = None, limit: int = 20
) -> Dict[str, Any]:
    """Busca artículos de ferretería por nombre, descripción o ID de categoría.

    Args:
        query: Término de búsqueda parcial para coincidir con nombre o descripción.
        category_id: ID opcional (UUID) de la categoría para filtrar.
        limit: Cantidad máxima de resultados a retornar (por defecto 20).

    Returns:
        Dict con la lista de artículos coincidentes o mensaje de error.
    """
    try:
        products = inventory_service.search_products(query, category_id, limit)
        return {
            "status": "success",
            "total": len(products),
            "products": products,
        }
    except Exception as err:
        return {"status": "error", "isError": True, "message": str(err)}


def get_product_details(
    product_id: Optional[str] = None
) -> Dict[str, Any]:
    """Obtiene la ficha de un artículo con sus variantes de inventario (stock, precio y ubicación).

    Args:
        product_id: ID (UUID) del artículo.

    Returns:
        Ficha del artículo con sus variantes de inventario o mensaje de error.
    """
    if product_id is None:
        return {
            "status": "error",
            "isError": True,
            "message": "Debe proporcionar 'product_id'.",
        }

    try:
        product = inventory_service.get_product_details(product_id)
        if product is None:
            return {
                "status": "not_found",
                "message": f"No se encontró ningún artículo con product_id='{product_id}'.",
            }
        return {"status": "success", "product": product}
    except Exception as err:
        return {"status": "error", "isError": True, "message": str(err)}


def check_low_stock() -> Dict[str, Any]:
    """Lista las variantes de inventario cuyo stock actual sea menor o igual a su stock mínimo.

    Returns:
        Dict con los artículos en condición crítica de repuesto/stock.
    """
    try:
        critical_items = inventory_service.check_low_stock()
        return {
            "status": "success",
            "low_stock_count": len(critical_items),
            "critical_products": critical_items,
        }
    except Exception as err:
        return {"status": "error", "isError": True, "message": str(err)}


def list_categories() -> Dict[str, Any]:
    """Lista todas las categorías de artículos registradas en la ferretería.

    Returns:
        Listado de categorías con ID, nombre y descripción.
    """
    try:
        categories = inventory_service.list_categories()
        return {"status": "success", "total": len(categories), "categories": categories}
    except Exception as err:
        return {"status": "error", "isError": True, "message": str(err)}


def get_stock_inventory(
    article_id: Optional[str] = None, limit: int = 50
) -> Dict[str, Any]:
    """Consulta el stock actual de las variantes de inventario, opcionalmente filtrado por artículo.

    Args:
        article_id: ID opcional (UUID) del artículo para filtrar.
        limit: Cantidad máxima de registros a retornar.

    Returns:
        Stock actual de las variantes de inventario con ubicación y medida.
    """
    try:
        stock = inventory_service.get_stock_inventory(article_id, limit)
        return {
            "status": "success",
            "total_stock": len(stock),
            "stock": stock,
        }
    except Exception as err:
        return {"status": "error", "isError": True, "message": str(err)}
